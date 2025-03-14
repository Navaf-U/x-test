"use client";

import { setSelectedUserId } from "@/lib/store/features/chat-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import {
  fetchParticipants,
} from "@/lib/store/thunks/chat-thunks";
import React, { useEffect, useState } from "react";
import { LoggedUser } from "../home/tweets/tweet";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import useConnectSocket, { socket } from "@/lib/socket";

export default function ChatList() {
  const { participants, users } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const [loginedUser, setLoginedUser] = useState<LoggedUser | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  useConnectSocket();

  useEffect(() => {
    dispatch(fetchParticipants());
    setLoginedUser(user);
  }, [dispatch, user]);

  const handleUserSelect = async ({
    userId,
    userName,
  }: {
    userId: string;
    userName: string;
  }) => {
    const user1 = loginedUser?.id;
    const user2 = userId;
    dispatch(setSelectedUserId(userId));
    try {
      const isUserAlreadyInChat = participants?.some((i) => i._id === userId);

      if (socket && socket.connected) {
        if (isUserAlreadyInChat) {
          const { data } = await axiosInstance.get(
            `/messages/chats/${user?._id}/${user2}`
          );
          const chatId = data?.chatId;
          console.log("chat id", data.chatId);
          if (chatId) {
            socket.emit("joinRoom", { chatId });
            router.push(`/messages/${chatId}/${userName}`);
          }
        } else {
          const { data } = await axiosInstance.post(`/chats/create`, {
            user1,
            user2,
          });
          const chatId = data?.data?.chatId;
          if (chatId) {
            socket.emit("joinRoom", { chatId });
            router.push(`/messages/${chatId}/${userName}`);
          }
        }
      } else {
        console.error("Socket is not connected or undefined");
      }
    } catch (error) {
      console.error("Error handling user selection:", error);
    }
  };

  const list = users.length < 1 ? participants : users;

  return (
    <div>
      <div className="w-full border-r border-gray-800">
        <div className="text-2xl font-bold p-4">Messages</div>
        <div className="py-4">
          <input
            type="text"
            placeholder="Search user..."
            className="w-full p-2 bg-gray-900 text-white rounded-md"
          />
          <div className="overflow-y-auto h-[calc(100vh-150px)]">
            {list?.map((user) => (
              <div
                key={user._id}
                className="p-4 hover:bg-gray-800 cursor-pointer border-gray-600 border-b"
                onClick={() =>
                  handleUserSelect({
                    userId: user._id,
                    userName: user.userName,
                  })
                }
              >
                <h3 className="text-lg font-semibold">{user.userName}</h3>
                <p className="text-gray-400 text-sm">Last message...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
