import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { postToJSON } from '@/lib/firebase';
import { useState } from 'react';
import PostFeed from '@/components/PostFeed';
import { firestore } from '@/lib/firebase';


// Max post to query per page.
const LIMIT = 1;
export async function getServerSideProps( context ) {
  const postsQuery = firestore
    .collectionGroup("posts") // This grabs all the posts from every user!
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(LIMIT)

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: {posts}, // Will be passed to the page component as props.
  }
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts) // Set this as a state as we will set it again when updating.
  const [loading, setLoading] = useState(false)
  const [postsEnd, setPostsEnd] = useState(false)

  const getMorePosts = async () => {
    setLoading(true)
    const last = posts[posts.length - 1];
    if (last == null) {
      setLoading(false)
      setPostsEnd(true)
      return
    };

    const cursor = typeof last.createdAt === "number" ? fromMillis(last.createdAt) : last.createdAt

    const query = firestore
      .collectionGroup("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(cursor)
      .limit(LIMIT)

      const newPosts = (await query.get()).docs.map( (doc) => doc.data() );

      setPosts(posts.concat(newPosts));
      setLoading(false)

      if (newPosts.length < LIMIT) {
        setPostsEnd(true);
      }
  }

  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

      <Loader show={loading} />

      {postsEnd && "You have reached the end!"}
    </main>
  )
}
