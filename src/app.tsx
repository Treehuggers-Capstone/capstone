import React, { useState, useEffect } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Feed from './components/feedComponent/feed';
import Map from './components/mapComponent/map';
import Account from './components/accountComponent/account';
import CreateJob from './components/jobComponents/createJob';
import { useDispatch, useSelector } from 'react-redux';
import Landing from './components/landingComponent/landing';
import JobDetails from './components/jobDetailsComponent/jobDetails';
import Inbox from './components/inboxComponent/inbox';
import { cookieLogin } from './store/user/userActions';
import SelectedChatroom from './components/inboxComponent/chatroom';
import io from 'socket.io-client';
import { fetchChatroomMessages } from './store/inbox/inboxActions';
import { StoreState } from './store/store';
import { fetchNewAlerts } from './store/alert/alertActions';

const App: React.FC = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const dispatch = useDispatch();
  const { user } = useSelector((state: StoreState) => state);
  useEffect(() => {
    dispatch(cookieLogin());
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [window.innerWidth]);
  const SOCKET_IO_URL = 'http://localhost:3000';
  const socket = io(SOCKET_IO_URL);
  socket.on('newMessage', data => {
    const users = data.chatusers.split('/');
    if (users.includes(user.id)) {
      setTimeout(() => dispatch(fetchChatroomMessages(data.id, user.id)), 500);
    }
  });
  socket.on('alert', userId => {
    if (userId === user.id) {
      dispatch(fetchNewAlerts(userId));
    }
  });
  return (
    <div>
      <Navbar />
      <div className="contentWrapper">
        <Switch>
          <Route exact path="/" render={() => <Landing />} />
          <Route path="/map" render={() => <Map />} />
          <Route path="/account" render={() => <Account />} />
          <Route exact path="/jobs" component={Feed} />
          <Route path="/jobs/:id" component={JobDetails} />
          <Route path="/create" component={CreateJob} />
          <Route exact path="/inbox" component={Inbox} />
          <Route path="/inbox/:id?" component={SelectedChatroom} />
          <Redirect to="/jobs" />
        </Switch>
      </div>
      {width <= 600 ? <Footer /> : null}
    </div>
  );
};

export default App;
