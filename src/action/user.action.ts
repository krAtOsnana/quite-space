"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { use } from "react";

export async function syncUser() {
  //taking details form of  the user from clerk and saving it in the database
  try {
    const user = await currentUser(); // Fetch everything at once

    if (!user) return;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id } // Use user.id from currentUser()
    });

    if (existingUser) return existingUser;  // If user exists, return it


    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,  // No need for auth()
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split('@')[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      }
    });

    return dbUser;
  } catch (error) {
    console.log('error in syncUser', error);
  }
}

export async function getUserByClerkId (clerkId: string){
  try {
    return await prisma.user.findUnique({
      where:{
        clerkId,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          }
        }
      }
    })
  } catch (error) {
    console.log("error in getUserByClerkId", error)
  }
  
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();
    
    if (!userId) return [];

    //getting 3 random user excluding ourself and the already followed user

    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 4,
    });

    return randomUsers;
  } catch (error) {
    console.log("Error fetching the random users ", error);
    return [];
  }

}

//targetUserId : the user we try to follow or unfollow
export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "User not authenticated" };
    if (userId === targetUserId) return { success: false, error: "You cannot follow yourself" };

    // Attempt to unfollow first
    const unfollowResult = await prisma.follows.deleteMany({
      where: { followerId: userId, followingId: targetUserId },
    });

    if (unfollowResult.count === 0) {
      // If no rows were deleted, create a follow relationship
      await prisma.$transaction([
        prisma.follows.create({
          data: { followerId: userId, followingId: targetUserId },
        }),
        prisma.notification.create({
          data: { type: "FOLLOW", userId: targetUserId, creatorId: userId },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ Error in toggleFollow:", error);
    return { success: false, error: "Error toggling follow" };
  }
}
