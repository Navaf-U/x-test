"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { fetchUserData } from "@/lib/store/thunks/user-thunks";
import { useAppDispatch } from "@/lib/store/hook";
import EditProfileModal from "../../../../components/profile/editProfile";
import Sidebar from "@/components/sidebar/left-sidebar";
import SearchSection from "@/components/home/search-section/search-section";
import ProfileHeader from "@/components/profile/ProfileHeader";

const getParams = (pathname: string) => {
  const parts = pathname.split("/");
  return { userName: parts[parts.length - 1] };
};

const ProfilePage = () => {
  const pathname = usePathname();
  const { userName } = getParams(pathname);
  const dispatch = useAppDispatch();
  const [userProfile, setUserProfile] = useState<{ username: string; fullname: string; bio: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await dispatch(fetchUserData(userName)).unwrap();
        setUserProfile(user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchProfile();
  }, [dispatch, userName]);

  if (!userProfile) {
    return <div className="text-center text-white">Loading profile...</div>;
  }

  const isCurrentUser = currentUser?.username === userName;

  return (
    <div className="flex h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto">
        <ProfileHeader user={userProfile} />
        <div className="p-6 pb-2 mt-16">
          <div>
            <h2 className="text-xl font-bold">{userProfile.fullname}</h2>
            <p className="text-gray-300">@{userProfile.username}</p>
            {/* <h2 className="text-xl font-bold">About</h2>
            <p className="text-gray-300">{userProfile?.bio}</p> */}

          </div>
          {isCurrentUser ? (
            <div className="w-full flex justify-end mt-[-40px]">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
            >
              Edit Profile
            </button>
            </div>
          ) : (
            <div className="w-full flex justify-end mt-[-40px]">
              <button
              className="bg-white flex justify-center items-center px-4 py-2 rounded-full hover:bg-gray-200 text-black"
            >
              <p className="font-bold">Follow</p>
            </button>
            </div>
          )}
        </div>
        <div className="p-6 flex gap-6">
          <p>0 follwoing</p>
          <p>0 followers</p>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold">Posts</h2>
          {/* Render user posts here */}
        </div>
      </div>
      <div className="w-[350px] hidden lg:block">
        <SearchSection />
      </div>
      {isEditing && (
        <EditProfileModal user={userProfile} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
