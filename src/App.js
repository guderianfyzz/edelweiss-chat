import React, { useRef, useState} from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Ed25519Keypair, JsonRpcProvider, RawSigner } from '@mysten/sui.js';

firebase.initializeApp({
  apiKey: "AIzaSyDby2m0uOBKcOgGtGWP6Vw3koVj18ZjDJU",
  authDomain: "atem-test.firebaseapp.com",
  databaseURL: "https://atem-test-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "atem-test",
  storageBucket: "atem-test.appspot.com",
  messagingSenderId: "236555037878",
  appId: "1:236555037878:web:02337edbe3db5bb57e8a17",
  measurementId: "G-14906R2Q1H"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();
const provider = new JsonRpcProvider();

function callFun() {
  const keypair = new Ed25519Keypair();
  const provider2 = new JsonRpcProvider();
  const signer = new RawSigner(keypair, provider);
  // console.log({keypair});
  // console.log({provider2});
  // console.log({signer});

  // console.log('hello world');

  const moveCallTxn = signer.executeMoveCall({
    packageObjectId: '0x0702dbaded6e93d996be20859cd3a2d567668b23',
    module: 'write',
    function: 'create_message',
    typeArguments: [],
    arguments: [
      'tMessage2',
      12315,
      'test',
    ],
    gasBudget: 10000,
  }).then(e => console.log(e));
  
   console.log('moveCallTxn', moveCallTxn);
}


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App">
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
  )
}

 function ChatRoom() {
  const dummy = useRef();
  const messageRef = firestore.collection('message');
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth'});
  }

  const objects = provider.getObjectsOwnedByAddress('0x8eac71ad5847ae1809f7ee21d6ea05768ba73eaf').then( o =>
    console.log({o})
  );

  console.log("run call fun");
  callFun();

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}  
      <span ref={dummy}></span>
    </main>  
  <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice"></input>

      <button tuype="submit" disabled={!formValue}></button>
  </form>
  </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}></img>
      <p>{text}</p>
    </div>
  </>
  )
}

export default App;
