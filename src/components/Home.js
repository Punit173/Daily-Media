import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase/firebase'; // Adjust the import based on your file structure
import { ref as dbRef, set, push, onValue } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth"; // To handle logout
import { FiSend } from 'react-icons/fi';  // Send icon
import { RiImageAddFill } from 'react-icons/ri';  // Image upload icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Login from './Login'; // Assuming Login component is used for user login
import './Home.css';

const Home = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State to hold messages
  const [image, setImage] = useState(null); // State to hold selected image
  const [selectedUser, setSelectedUser] = useState('nonselecteduser'); // State for selected user
  const [showfullimg, setshowfullimg] = useState(false);
  const [fullimgsrc, setfullimgsrc] = useState("");
  const [users, setusers] = useState([]);
  const [sidebar, setsidebar] = useState(true);
  const [sidebarcont, setsidebarcont] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Holds the logged-in user
  
  const username = localStorage.getItem("email");

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
    const screenWidth = window.innerWidth;
    setsidebar(screenWidth < 768);

    const msgRef = dbRef(db, 'dailymedia/');
    onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];
      const newUsers = new Set(users); // Using a Set to avoid duplicates

      for (let id in data) {
        const { msgfrom, msgto, user } = data[id];
        newUsers.add(user);

        if ((msgfrom === username && msgto === selectedUser) || 
            (msgto === username && msgfrom === selectedUser)) {
          loadedMessages.push({ id, ...data[id] });
        }
      }

      setusers(Array.from(newUsers));
      loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(loadedMessages);
    });
  }, [username, selectedUser]);

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
          user: username,
          timestamp: timestamp,
          msgto: selectedUser,
          msgfrom: username,
          message: message || '', // Text message, if any
          imageUrl: '', // Will be updated if image is uploaded
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
    return <Login />;
  }

  return (
    <div className="relative flex flex-col h-screen  text-gray-900">
      {/* Background video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        autoPlay
        muted
        loop
      >
        <source src="\chatbg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-gray-900 text-white p-4 shadow-md opacity-70">
        {sidebar ? (
          <button onClick={() => setsidebarcont(!sidebarcont)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        ) : (
          <div className="text-xl font-semibold">DailyMedia</div>
        )}
        <ul className="flex space-x-6">
          <li className="hover:text-yellow-600 cursor-pointer">Home</li>
          <li className="hover:text-yellow-600 cursor-pointer">Profile</li>
          <li className="hover:text-yellow-600 cursor-pointer">Settings</li>
          <li className="hover:text-red-400 cursor-pointer" onClick={handleLogout}>
            Logout
          </li> {/* Logout button */}
        </ul>
      </nav>

      <div className="flex flex-grow overflow-hidden ">
        {/* Sidebar */}
        <div className={`w-64 bg-gray-800 text-yellow-300 p-6 ${sidebarcont && 'hidden'} md:block opacity-80`}>
          <h3 className="text-lg font-bold mb-4">Direct Messages</h3>
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user}
                className={`cursor-pointer ${user === selectedUser ? 'bg-yellow-600 text-black' : ''} p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap`}
                onClick={() => handleUserSelect(user)}
              >
                {(username === user) ? "Me" : user}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col flex-grow ">
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl shadow-md max-w-fit text-left opacity-90 ${msg.msgfrom === username ? 'mr-auto bg-gray-900 text-yellow-300 ' : 'ml-auto bg-yellow-600 text-white'}`}
              >
                <strong className={`block text-xl ${msg.msgfrom === username ? 'text-white' : 'text-black'} mb-1`}>{msg.msgfrom}</strong>
                {msg.message && <div>{msg.message}</div>}
                {msg.imageUrl && <button onClick={() => { setshowfullimg(true); setfullimgsrc(msg.imageUrl); }} className="mt-2">
                  <img src={msg.imageUrl} alt="Uploaded" className="mt-2 rounded-xl w-80" />
                </button>}
              </div>
            ))}
          </div>

          {/* Preview full image */}
          {showfullimg && (
            <div
              onClick={() => setshowfullimg(false)} // Dismiss when clicking outside
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            >
              <img
                src={fullimgsrc}
                alt="Uploaded"
                onClick={(e) => e.stopPropagation()} // Prevent dismissal when clicking the image
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Chatbox */}
          <div className="flex items-center p-4 bg-gray-700 text-yellow-300  opacity-40">
            <input
              type="file"
              onChange={handleImageChange}
              className="hidden"
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="cursor-pointer mr-4">
              <RiImageAddFill size={24} />
            </label>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleSendMessage}
              className="flex-grow p-2 rounded-lg bg-gray-600 text-yellow-200 focus:outline-none focus:ring focus:ring-yellow-300"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 ml-4 text-yellow-300 hover:text-yellow-500 focus:outline-none"
            >
              <FiSend size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
