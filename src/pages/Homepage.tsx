import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useKeycloak } from "@react-keycloak/web";
import Nav from '../components/Nav';

const Home = () => {

  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const isLoggedIn = keycloak.authenticated;

  useEffect(()=>{
    // console.log(isLoggedIn)
    if(isLoggedIn){
      navigate("/secured")
    }
  },[isLoggedIn])

 return (
   <div>
     <h4 className="text-green-800 text-4xl mt-5 text-center">Welcome to Collaboard!</h4>
   </div>
 );
};

export default Home;
