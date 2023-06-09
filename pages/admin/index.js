import AuthCheck from "@/components/AuthCheck";
import styles from '../../styles/Admin.module.css';
import { UserContext } from "@/lib/context";
import kebabCase from 'lodash.kebabcase';
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import {useCollection} from "react-firebase-hooks/firestore"
import { toast } from "react-hot-toast";
import { firestore, auth, serverTimestamp } from '../../lib/firebase';
import PostFeed from "@/components/PostFeed";

export default function AdminPostsPage(props) {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />

      
      </AuthCheck>
    </main>
  )
}

function PostList() {
  const ref = firestore.collection("users").doc(auth.currentUser.uid).collection("posts")
  const query = ref.orderBy("createdAt")
  const [querySnapshot] = useCollection(query);

  const posts = querySnapshot?.docs.map( (doc) => doc.data() )


  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  )
}

function CreateNewPost() {
  const router = useRouter()
  const { username } = useContext(UserContext)
  const [title, setTitle] = useState("")

  // Ensure the title does only contains url friendly characters.
  const slug = encodeURI(kebabCase(title));

  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e) => {
    e.preventDefault()

    const uid = auth.currentUser.uid
    const ref = firestore.collection("users").doc(uid).collection("posts").doc(slug)

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "#Hello World",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    }

    await ref.set(data)

    toast.success("Post created!")

    // Move them to the newly created post.
    router.push(`/admin/${slug}`) 
  }

  return (
    <form onSubmit={createPost}>
      <input 
        value={title}
        onChange={ (e) => setTitle(e.target.value)}
        placeholder="An article title"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit"  disabled={!isValid} className="btn-green">
        Create new Post
      </button>
    </form>
  )

}