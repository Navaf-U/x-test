"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import {
  fetchFollowing,
  fetchFollowCount,
} from "@/lib/store/features/follow-slice";
import { fetchUserData } from "@/lib/store/thunks/user-thunks";
import SearchSection from "../home/search-section/search-section";
import Image from "next/image";

const ProfilePage = () => {
  const pathname = usePathname();
  const userName = pathname.split("/")[2];
  const dispatch = useAppDispatch();
  const { following, followingCount, status } = useAppSelector(
    (state) => state.follow
  ) as {
    following: {
      following: {
        _id: string;
        fullname?: string;
        userName: string;
        pfp: string;
      };
    }[];
    followingCount: number;
    status: string;
  };

  const [userProfile, setUserProfile] = useState<{
    _id: string;
    username: string;
    fullname: string;
    bio: string;
  } | null>(null);

  useEffect(() => {
    if (userName) {
      dispatch(fetchUserData(userName)).then((res) => {
        if (res.payload?._id) {
          setUserProfile(res.payload);
          dispatch(fetchFollowing(res.payload?._id));
          dispatch(fetchFollowCount(res.payload?._id));
        }
      });
    }
  }, [userName, dispatch]);

  return (
    <div className="flex h-screen justify-between bg-[#090808]">
      <div className=" p-6 flex-col flex w-full">
        {userProfile ? (
          <>
            <div className="mb-6 p-4 bg-black rounded-2xl shadow-lg">
              <h1 className="text-3xl font-bold">{userProfile.fullname}</h1>
              <p className="text-gray-600">@{userProfile.username}</p>
              <p className="mt-2 text-lg">{followingCount} Following</p>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Following</h2>
            {status === "loading" ? (
              <p className="text-gray-500">Loading...</p>
            ) : following.length > 0 ? (
              <ul className="space-y-4">
                {following.map((follow,index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        width={10}
                        height={10}
                        src={follow?.following?.pfp || "https://i.pinimg.com/736x/20/05/e2/2005e27a39fa5f6d97b2e0a95233b2be.jpg" }
                        alt={"profile"}
                        className="w-12 h-12 rounded-full border-2 border-gray-300"
                      />
                      <div>
                        <p className="font-bold text-lg">
                          {follow?.following?.fullname}
                        </p>
                        <p className="text-sm text-gray-600">
                          @{follow?.following?.userName}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/profile/${follow?.following?.userName}`}
                      className="px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-md"
                    >
                      View Profile
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No users followed yet.</p>
            )}
          </>
        ) : (
          <p className="text-gray-500">Loading profile...</p>
        )}
      </div>
      <div className="md:w-1/3 p-6">
        <SearchSection />
      </div>
    </div>
  );
};

export default ProfilePage;
