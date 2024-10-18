import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/firebase'; // Adjust the import based on your file structure
import { ref as dbRef, set, push, onValue } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "./Home.css";

const Home = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State to hold messages
  const [image, setImage] = useState(null); // State to hold selected image

  // Get the current user's information from local storage
  const username = "akshat"
  const password = "hello" // Assuming password is stored as well

  // Function to retrieve messages from Firebase and filter them based on the username
  useEffect(() => {
    const msgRef = dbRef(db, 'dailymedia/');
    onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];
      for (let id in data) {
        // Only add messages that were sent from this user
        if (data[id].msgfrom === username || data[id].msgto === username) {
          loadedMessages.push({ id, ...data[id] });
         
        }
      }
      // Sort by timestamp to display in order of upload
      loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(loadedMessages); // Set the filtered messages to state
    });
  }, [username]);

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Function to send messages or images
  const handleSendMessage = (e) => {
    if (e.key === 'Enter' && (message.trim() || image)) {
      const timestamp = Date.now();
      const msgRef = dbRef(db, 'dailymedia/');
      const newMessageRef = push(msgRef);

      const messageData = {
        user: username,
        pass: password,
        timestamp: timestamp,
        msgto: 'recipientUser', // Change this value as needed
        msgfrom: username,
        message: message || '', // Text message, if any
        imageUrl: '', // Will be updated if image is uploaded
      };

      if (image) {
        const imgRef = storageRef(storage, `images/${image.name}_${timestamp}`);
        const uploadTask = uploadBytesResumable(imgRef, image);

        // Handle upload and get download URL for the image
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
        // No image, just send the text message
        set(newMessageRef, messageData)
          .then(() => {
            setMessage(''); // Clear input after sending
          })
          .catch((error) => {
            console.error("Error sending message: ", error);
          });
      }
    }
  };

  return (
    <div style={{marginTop: "100px", padding: "50px", height:"100%"}}>
      <div className='msg_parent'>
        {messages.map((msg) => (
          <div key={msg.id} className='message'>
            <strong style={{ borderRadius: "15px", padding: "10px", fontSize: "15px"}}>
              {msg.msgfrom}
            </strong>
            {msg.message && <div className='fromlabel'>{msg.message}</div>}
            {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
          </div>
        ))}
      </div>

      <div className='chatbox'>
        <center>
          <input
            type="text"
            placeholder='Enter Message!'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSendMessage} // Listen for Enter key press
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange} // Handle image selection
          />
        </center>
      </div>
    </div>
  );
};

export default Home;
