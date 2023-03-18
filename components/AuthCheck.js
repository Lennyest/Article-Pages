import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "@/lib/context";



// Check if user is logged in, if not, forward them to the sign in page.
export default function AuthCheck(props) {
    // Get the username from context
    const {username} = useContext(UserContext);

    return username ?
        props.children :
        props.fallback || <Link href="/enter">You must be signed in to use this feature.</Link>

}