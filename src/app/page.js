import Main from "../components/Main";
import Navbar from "../components/Navbar";
import VideoBackground from "../components/VideoBackground";

export default function Home() {
  return <>
    <VideoBackground 
      src="/assets/videos/video5.mp4" 
      opacity={1} 
      blur={0} 
    />
    <Navbar />
    <Main />
  </>;
}
