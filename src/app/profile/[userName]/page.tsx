import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/action/profile.action";
import { icons } from "lucide-react";
import { notFound } from "next/navigation";
import { describe } from "node:test";
import React from "react";
import ProfilePageClient from "./ProfilePageClient";

export async function generateMetadata({ params }: { params: {userName: string} }){

  const user = await getProfileByUsername(params.userName)
  if(!user) return;
  return {
    title: `${user.name ?? user.username} `,
    description: user.bio || `checkOut ${user.username}'s profile`
  }
}

const Profilepage = async ({ params }: { params: {userName: string} } ) => {


  
  const user = await getProfileByUsername(params.userName)
  if(!user ) return notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);
  
  return <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
};

export default Profilepage;
