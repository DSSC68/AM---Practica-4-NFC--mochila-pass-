package expo.modules.hcecredencial

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Modulo de Expo: expone a JavaScript las funciones para manejar la credencial NFC
// y el evento "onScan" que avisa cuando el escaner leyo el telefono.
class HceCredencialModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  // SharedPreferences: almacenamiento que comparten el modulo y el servicio HCE
  private val prefs
    get() = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  override fun definition() = ModuleDefinition {
    Name("HceCredencial")

    Events("onScan")

    // Al crearse el modulo se registra para recibir los avisos del servicio
    // y reenviarlos a JavaScript como evento "onScan"
    OnCreate {
      ScanNotifier.listener = { apdu, sent ->
        sendEvent(
          "onScan",
          mapOf("apdu" to apdu, "sent" to sent, "timestamp" to System.currentTimeMillis().toDouble())
        )
      }
    }

    OnDestroy {
      ScanNotifier.listener = null
    }

    // Estado del hardware: si tiene NFC, si soporta HCE y si el NFC esta encendido
    Function("getStatus") {
      val adapter = NfcAdapter.getDefaultAdapter(context)
      mapOf(
        "hasNfc" to (adapter != null),
        "hasHce" to context.packageManager.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION),
        "nfcEnabled" to (adapter?.isEnabled == true)
      )
    }

    // Guarda los 4 bytes (en hex, ej. "A6AE0A00") que se enviaran al escaner
    Function("setCredential") { hexBytes: String ->
      require(hexBytes.length == 8) { "Se esperaban 4 bytes en hex" }
      prefs.edit().putString(KEY_ID_BYTES, hexBytes.uppercase()).apply()
    }

    // Regresa los bytes guardados (o null si no hay sesion)
    Function("getCredential") {
      prefs.getString(KEY_ID_BYTES, null)
    }

    // Borra la credencial: el servicio respondera "sin credencial" (6A 82)
    Function("clearCredential") {
      prefs.edit().remove(KEY_ID_BYTES).apply()
    }

    // Abre la pantalla de ajustes de NFC de Android
    Function("openNfcSettings") {
      val intent = Intent(Settings.ACTION_NFC_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }
  }
}
