import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import ChatBot from '../components/ChatBot';
const Home = () => {
  return (
    <div>
      <Header/>
    <SpecialityMenu/>
    <TopDoctors/>
    <Banner/>
    <ChatBot/>
    </div>
  )
}

export default Home