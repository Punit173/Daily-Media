/* right now only people who messaged before will show in side bar */

import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/firebase'; // Adjust the import based on your file structure
import { ref as dbRef, set, push, onValue } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FiSend } from 'react-icons/fi';  // Send icon
import { RiImageAddFill } from 'react-icons/ri';  // Image upload icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State to hold messages
  const [image, setImage] = useState(null); // State to hold selected image
  const [selectedUser, setSelectedUser] = useState('nonselecteduser'); // State for selected user
  const [showfullimg,setshowfullimg]=useState(false);
  const [fullimgsrc,setfullimgsrc]=useState("");
   // Example list of users for direct messages
  const [users,setusers]=useState([]);
// Current user
  const username = localStorage.getItem("email"); 
  //for small screen replace with button for sidebar
  const [sidebar,setsidebar]=useState(true);
  //content for sidebar visible on click of sidebar button using this usestate
  const [sidebarcont,setsidebarcont]=useState(true);

 

  // Function to retrieve messages from Firebase and filter them based on the selected user
  useEffect(() => {
    //check width of screen
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      setsidebar(false); // Set sidebar to false for smaller screens
    } else {
      setsidebar(true); // Set sidebar to true for larger screens
    }
    console.log(sidebar); // Note: This may not log the updated state immediately
    
    //////////////////////






    const msgRef = dbRef(db, 'dailymedia/');
    onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];
      const newUsers = new Set(users); // Using a Set to avoid duplicates
  
      for (let id in data) {
        const { msgfrom, msgto,user } = data[id];
  
        // Add users to the Set set was used to preventt duplication of users
        newUsers.add(user);
  
        if ((msgfrom === username && msgto === selectedUser) || 
            (msgto === username && msgfrom === selectedUser)) {
          loadedMessages.push({ id, ...data[id] });
        }
      }
  
      // Update users state
      setusers(Array.from(newUsers));
  
      // Sort messages by timestamp
      loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(loadedMessages); // Set the filtered messages to state
    });
  }, [username, selectedUser]); // Ensure necessary dependencies are included
  
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
                messageData.imageUrl = downloadURL; // Set the image URL
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
        {sidebar ? (<button onClick={()=>{setsidebarcont(!sidebarcont)}}><FontAwesomeIcon icon={faBars} /></button>):(<div className="text-xl font-semibold">DailyMedia</div>)}
        <ul className="flex space-x-6">
          <li className="hover:text-yellow-600 cursor-pointer">Home</li>
          <li className="hover:text-yellow-600 cursor-pointer">Profile</li>
          <li className="hover:text-yellow-600 cursor-pointer">Settings</li>
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
             {(username===user)?"Me":user}
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
                <strong className={`block text-xl ${msg.msgfrom===username ? 'text-white':'text-black'} mb-1`}>{msg.msgfrom}</strong>
                {msg.message && <div>{msg.message}</div>}
                {msg.imageUrl && <button onClick={()=>{setshowfullimg(true);setfullimgsrc(msg.imageUrl);}} className="mt-2"><img src={msg.imageUrl} alt="Uploaded" className="mt-2 rounded-xl w-80" /></button>}
              </div>
            ))}
          </div>


{/*  preview image      */}    
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
          <div className="flex items-center p-4 bg-gray-900 text-white opacity-60">
            <input
              type="text"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleSendMessage}
              className="flex-grow p-2 rounded-lg bg-gray-800 text-white mr-2 outline-none"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <RiImageAddFill size={30} className="text-yellow-600" />
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button onClick={handleSendMessage} className="ml-2 p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-500">
              <FiSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
