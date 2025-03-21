

import { getPosts } from "@/action/post.action";
import { getDbUserId } from "@/action/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";

import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const page = async () => {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();
  // console.log(posts)

  return (
    <>
      <div className="grid grid-col-1 lg:grid-cols-10 gap-5 ">
        {/* leftside */}
        <div className="lg:col-span-6">
          {user ? <CreatePost /> : null}
          <div className="space-y-6">
          {posts.map((post)=>(
            <PostCard key={post.id} post={post} dbUserId={dbUserId}/>
          ))}
          </div>
        </div>
        {/* right side */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          <WhoToFollow/>
        </div>
      </div>
    </>
  );
};

export default page;
