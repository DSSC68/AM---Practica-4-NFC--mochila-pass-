// Manejo de la sesion: quien esta logueado, y conexion con la credencial NFC.
// Cualquier pantalla obtiene la sesion con useSession().
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Hce from '../../modules/hce-credencial';
import { login as apiLogin } from '../api/auth';
import { idToHex } from '../nfc/apdu';

// Llave con la que se guarda el usuario en el almacenamiento del telefono
const STORAGE_KEY = 'mochilapass.session';
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null); // usuario actual o null
  const [loading, setLoading] = useState(true); // true mientras se lee la sesion guardada

  // Al abrir la app recupera la sesion y vuelve a cargar la credencial en el servicio HCE
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!saved) return;
        const u = JSON.parse(saved);
        Hce.setCredential(idToHex(u.id));
        setUser(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Login: valida con la API, guarda los 4 bytes del ID para el NFC y recuerda la sesion
  const login = useCallback(async (username, password) => {
    const u = await apiLogin(username, password);
    Hce.setCredential(idToHex(u.id));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  // Logout: borra la credencial NFC (el escaner ya no recibe ningun ID) y la sesion guardada
  const logout = useCallback(async () => {
    Hce.clearCredential();
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, login, logout }}>{children}</SessionContext.Provider>
  );
}

// Hook para usar la sesion desde cualquier pantalla
export function useSession() {
  return useContext(SessionContext);
}
