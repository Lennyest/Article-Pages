import UserProfile from "@/components/UserProfile"
import PostFeed from "@/components/PostFeed"
import { getUserWithUsername, postToJSON } from "@/lib/firebase";

export default function UserProfilePage({ user, posts }) {
  return (
    <main>
      <UserProfile user={user}/>
      <PostFeed posts={posts}/>
    </main>
  )
}

// query == username search 
export async function getServerSideProps({query}) {
  const {username} = query;

  const userDoc = await getUserWithUsername(username);

  // If no user exists, we short circuit to a 404 page which is rendered by the main dir's 404.js file.
  if (!userDoc) {
    return {
      notFound: true,
    }
  }

  let user = null;
  let posts = null;

  // If the user document exists, query the server to retrieve their posts.
  if (userDoc) {
    user = userDoc.data();
    const postsQuery = userDoc.ref
      .collection("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc") // Order by descending
      .limit(5)

    posts = (await postsQuery.get()).docs.map(postToJSON);
  }

  return {
    props: {user, posts}, // Passing to page component
  }

}

