import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaBriefcase } from "react-icons/fa";


function Navbar(){

const {user, logout}=useAuth();

const navigate=useNavigate();

const [open,setOpen]=useState(false);



const handleLogout=()=>{

logout();

navigate("/login");

};



return(

<nav style={styles.nav}>


<Link to="/dashboard" style={styles.logo}>

<FaBriefcase/>

JobTracker AI

</Link>



<div style={styles.right}>


{
user && (

<>

<button

style={styles.profile}

onClick={()=>setOpen(!open)}

>

👤 {user.email.split("@")[0]}

</button>



{
open && (

<div style={styles.menu}>


<Link to="/dashboard" style={styles.item}>
Dashboard
</Link>


<Link to="/jobs" style={styles.item}>
Jobs
</Link>


<Link to="/resumes" style={styles.item}>
Resumes
</Link>


<Link to="/matches" style={styles.item}>
AI Matches
</Link>



<button

onClick={handleLogout}

style={styles.logout}

>
Logout
</button>


</div>

)

}


</>

)

}


</div>



</nav>


);


}



const styles={


nav:{

height:"55px",

background:"#17172b",

display:"flex",

alignItems:"center",

justifyContent:"space-between",

padding:"0 30px",

position:"relative"

},


logo:{

display:"flex",

alignItems:"center",

gap:"8px",

color:"white",

textDecoration:"none",

fontSize:"18px",

fontWeight:"bold"

},


right:{

position:"relative"

},


profile:{

background:"transparent",

border:"none",

color:"white",

cursor:"pointer",

fontSize:"15px"

},


menu:{

position:"absolute",

right:0,

top:"45px",

background:"white",

width:"170px",

padding:"15px",

borderRadius:"10px",

boxShadow:"0 5px 20px rgba(0,0,0,.15)",

zIndex:100

},


item:{

display:"block",

padding:"10px",

color:"#1a1a2e",

textDecoration:"none"

},


logout:{

width:"100%",

marginTop:"10px",

padding:"8px",

background:"#ef5350",

border:"none",

color:"white",

borderRadius:"5px",

cursor:"pointer"

}


};


export default Navbar;