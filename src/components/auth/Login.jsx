import  { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../../services/FirebaseService';

const auth = getAuth(app);
const db = getFirestore(app);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUserData(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Obtener datos adicionales de Firestore
      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setError('No se encontró el perfil de usuario.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Correo</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Entrar</button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      {userData && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <div><b>Nombre:</b> {userData.nombre}</div>
          <div><b>Rol:</b> {userData.rol}</div>
        </div>
      )}
    </div>
  );
};

export default Login;
