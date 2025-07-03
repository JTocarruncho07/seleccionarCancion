import { db, doc, getDoc, setDoc } from "firebase/firestore";

const ADMIN_DOC_REF = doc(db, "admin", "perfil");

export async function getAdminProfile() {
  const snap = await getDoc(ADMIN_DOC_REF);
  if (snap.exists()) {
    return snap.data();
  } else {
    // Si no existe, lo crea por defecto
    const defaultProfile = { nombre: "Laura", password: "admin123" };
    await setDoc(ADMIN_DOC_REF, defaultProfile);
    return defaultProfile;
  }
}

export async function updateAdminProfile(data) {
  await setDoc(ADMIN_DOC_REF, data, { merge: true });
} 