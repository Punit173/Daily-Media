import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase/firebase'; // Adjust the import based on your file structure
import { ref as dbRef, set, push, onValue } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth"; // To handle logout
import { FiSend } from 'react-icons/fi';  // Send icon
import { RiImageAddFill } from 'react-icons/ri';  // Image upload icon
import Login from './Login'
import './Home.css';

const Home = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State to hold messages
  const [image, setImage] = useState(null); // State to hold selected image
  const [selectedUser, setSelectedUser] = useState('recipientUser'); // State for selected user
  const [currentUser, setCurrentUser] = useState(null); // Holds the logged-in user

  const users = ['recipientUser', 'friend1', 'friend2', 'friend3', 'akshat'];

  // Get the logged-in user from Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to retrieve messages from Firebase and filter them based on the selected user
  useEffect(() => {
    if (!currentUser) return;

    const msgRef = dbRef(db, 'dailymedia/');
    onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];
      for (let id in data) {
        if (
          (data[id].msgfrom === currentUser.uid && data[id].msgto === selectedUser) || 
          (data[id].msgto === currentUser.uid && data[id].msgfrom === selectedUser)
        ) {
          loadedMessages.push({ id, ...data[id] });
        }
      }
      loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(loadedMessages);
    });
  }, [currentUser, selectedUser]);

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Function to send messages or images
  const handleSendMessage = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (message.trim() || image) {
        const timestamp = Date.now();
        const msgRef = dbRef(db, 'dailymedia/');
        const newMessageRef = push(msgRef);

        const messageData = {
          msgfrom: currentUser.uid,
          msgto: selectedUser,
          message: message || '', // Text message, if any
          imageUrl: '', // Will be updated if image is uploaded
          timestamp,
        };

        if (image) {
          const imgRef = storageRef(storage, `images/${image.name}_${timestamp}`);
          const uploadTask = uploadBytesResumable(imgRef, image);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Optional: Track upload progress here
            },
            (error) => {
              console.error("Image upload error:", error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                messageData.imageUrl = downloadURL;
                set(newMessageRef, messageData).then(() => {
                  setMessage(''); // Clear input after sending
                  setImage(null); // Clear image after sending
                });
              });
            }
          );
        } else {
          set(newMessageRef, messageData)
            .then(() => {
              setMessage(''); // Clear input after sending
            })
            .catch((error) => {
              console.error("Error sending message: ", error);
            });
        }
      }
    }
  };

  // Handle user selection for direct message
  const handleUserSelect = (user) => {
    setSelectedUser(user); // Change the recipient
  };

  // Handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out successfully");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  if (!currentUser) {
    return <Login/>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-300 to-black text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-gray-900 text-white p-4 shadow-md">
        <div className="text-xl font-semibold">ChatApp</div>
        <ul className="flex space-x-6">
          <li className="hover:text-blue-400 cursor-pointer">Home</li>
          <li className="hover:text-blue-400 cursor-pointer">Profile</li>
          <li className="hover:text-blue-400 cursor-pointer">Settings</li>
          <li className="hover:text-red-400 cursor-pointer" onClick={handleLogout}>Logout</li> {/* Logout button */}
        </ul>
      </nav>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-blue-300 p-6 hidden md:block">
          <h3 className="text-lg font-bold mb-4">Direct Messages</h3>
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user}
                className={`cursor-pointer ${user === selectedUser ? 'bg-blue-400 text-black' : ''} p-2 rounded`}
                onClick={() => handleUserSelect(user)}
              >
                {user}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col flex-grow">
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl shadow-md max-w-fit text-left ${msg.msgfrom === currentUser.uid ? 'mr-auto bg-gray-900 text-blue-300 ' : 'ml-auto bg-gray-300 text-gray-900'}`}
              >
                <strong className={`block text-xl ${msg.msgfrom === currentUser.uid ? 'text-white' : 'text-blue-500'} mb-1`}>{msg.msgfrom === currentUser.uid ? 'You' : selectedUser}</strong>
                {msg.message && <div>{msg.message}</div>}
                {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded" className="mt-2 rounded-xl" />}
              </div>
            ))}
          </div>

          {/* Chatbox */}
          <div className="flex items-center p-4 bg-gray-900 text-white">
            <input
              type="text"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleSendMessage}
              className="flex-grow p-2 rounded-lg bg-gray-800 text-white mr-2 outline-none"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <RiImageAddFill size={30} className="text-blue-400" />
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button onClick={handleSendMessage} className="ml-2 p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500">
              <FiSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
