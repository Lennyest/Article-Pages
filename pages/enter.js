import { firestore, auth, googleAuthProvider } from "../lib/firebase"
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../lib/context";
import debounce from "lodash.debounce";

export default function Enter(props) {
  const {user, username} = useContext(UserContext)

  return (
    <main>
      {user ?
          !username ? <UsernameForm /> : <SignOutButton />
        :
          <SignInButton />
      }
    </main>
  )
}

// Sign in with Google button
function SignInButton() {
  const signInWithGoogle = async () => {
    // Wrap this in a try catch.
    await auth.signInWithPopup(googleAuthProvider)
  }


  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} />Sign in with Google
    </button>
  )
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const {user, username} = useContext(UserContext)

  // Every time value changes, we run this.
  useEffect( () => {
    checkUsername(formValue)
  }, [formValue])

  const onSubmit = async (e) => {
    e.preventDefault(); // Prevents refreshing


    // Get the user document from the database.
    const userDoc = firestore.doc(`users/${user.uid}`)
    // Gets the username document from the database.
    const usernameDoc = firestore.doc(`username/${formValue}`)

    // A batch is several "commits" in one or as a 'batch' of operations.
    const batch = firestore.batch();
    batch.set(userDoc, {username: formValue, photoURL: user.photoURL, displayName: user.displayName})
    batch.set(usernameDoc, {uid: user.uid})

    await batch.commit();
  }

  const onChange = (e) => {
    const val = e.target.value.toLowerCase()
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
    
    // Too short!
    if (val.length < 3) {
      setFormValue(val)
      setLoading(false)
      setIsValid(false)
    }
    
    // Compare with regex var above
    if (re.test(val)) {
      setFormValue(val)
      setLoading(true)
      setIsValid(false)
    }
  }

  // Debouncing the username to prevent lots of requests.
  // useCallback is required for debounce to work.
  // We utilize useCallback instead of useEffect as we don't want to recreate the function every change.
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = firestore.doc(`usernames/${username}`)
        const {exists} = await ref.get();

        setIsValid(!exists)
        setLoading(false)
      }
    }, 500),
  []);

  return (
    !username && (
      <section>
        <h3>Choose a Username 📄</h3>        
        <form onSubmit={onSubmit}>
          <input name="username" placeholder="Username" value={formValue} onChange={onChange}/>
          <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
          <button type="submit" className="btn-green" disabled={!isValid}>
            Submit
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  )

}

// Returns simple html depending on the provided paramaters.
function UsernameMessage({username, isValid, loading}) {
  if (loading) {
    return <p>Checking...</p>
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>
  } else if (username && !isValid) {
    if (username.length < 3) {
      return <p className="text-danger">{username} is too short.</p>
    } else {
      return <p className="text-danger">{username} is taken.</p>
    }
  } else {
    return <p></p>
  }
}