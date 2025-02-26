import Image from 'next/image';
import React from 'react';

interface UserProfile {
  fullname: string;
  username: string;
  bio?: string;
  profile?: string;
  header?: string;
}

interface ProfileHeaderProps {
  user: UserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div 

      className="p-4 rounded-lg h-[160px] shadow"
      style={{
        backgroundImage: `url(${user?.header || 'https://i.pinimg.com/736x/3a/c8/c4/3ac8c49fd8ba87a6dc02cc80b5015b7b.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="flex items-end md:mt-[80px] h-full">
        <Image
          src={user?.profile || ''}
          alt="Avatar"
          width={74}
          height={50}
          className="w-28 h-28 object-cover rounded-full mr-4"
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
