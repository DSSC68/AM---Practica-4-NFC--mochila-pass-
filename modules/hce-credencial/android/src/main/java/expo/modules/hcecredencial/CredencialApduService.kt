package expo.modules.hcecredencial

import android.content.Context
import android.nfc.cardemulation.HostApduService
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log

// Etiqueta para los logs (adb logcat -s APDU) y nombres del almacenamiento compartido
const val TAG = "APDU"
const val PREFS = "CREDENCIAL_ID"
const val KEY_ID_BYTES = "ID_BYTES"

// Codigos de estado APDU
private val SW_OK = byteArrayOf(0x90.toByte(), 0x00)
private val SW_SIN_CREDENCIAL = byteArrayOf(0x6A.toByte(), 0x82.toByte()) // "file not found"
private val SW_ERROR = byteArrayOf(0x6F.toByte(), 0x00) // "no precise diagnosis"

// Conversion entre bytes y texto hexadecimal ("A6AE0A00")
fun ByteArray.toHex(): String = joinToString("") { "%02X".format(it) }

fun hexToBytes(hex: String): ByteArray =
  ByteArray(hex.length / 2) { i -> hex.substring(i * 2, i * 2 + 2).toInt(16).toByte() }

// Puente entre el servicio (corre aparte) y el modulo de JS para avisar que hubo escaneo
object ScanNotifier {
  @Volatile var listener: ((apdu: String, sent: Boolean) -> Unit)? = null
}

// Android llama a este servicio cuando el lector manda un SELECT con el AID F012345678.
// Respondemos los 4 bytes del ID de usuario + 90 00, igual que la app de ejemplo del profe.
class CredencialApduService : HostApduService() {

  // Se ejecuta cada vez que el lector manda un comando APDU (el SELECT AID del Arduino)
  override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
    if (commandApdu == null) return SW_ERROR
    Log.d(TAG, "APDU IN: ${commandApdu.toHex()}")

    // Lee los 4 bytes del ID que guardo la app al iniciar sesion
    val hex = getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_ID_BYTES, null)
    // Sin sesion: avisa a la app y responde "no encontrado"
    if (hex == null || hex.length != 8) {
      Log.d(TAG, "Sin credencial cargada (no hay sesion)")
      ScanNotifier.listener?.invoke(commandApdu.toHex(), false)
      return SW_SIN_CREDENCIAL
    }

    // Retroalimentacion: vibra y avisa a la pantalla de credencial
    vibrar()
    ScanNotifier.listener?.invoke(commandApdu.toHex(), true)
    // Respuesta: [4 bytes del ID] + 90 00 (exito)
    val respuesta = hexToBytes(hex) + SW_OK
    Log.d(TAG, "APDU OUT: ${respuesta.toHex()}")
    return respuesta
  }

  // Se llama cuando el lector se aleja o termina la comunicacion
  override fun onDeactivated(reason: Int) {
    Log.d(TAG, "onDeactivated reason=$reason")
  }

  // Vibracion corta de 120 ms (con la API nueva en Android 8+)
  private fun vibrar() {
    val vibrator = getSystemService(Vibrator::class.java) ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vibrator.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
    } else {
      @Suppress("DEPRECATION")
      vibrator.vibrate(120)
    }
  }
}
