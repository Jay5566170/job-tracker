import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

import {
  FaBriefcase,
  FaFileAlt,
  FaBullseye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaGift
} from "react-icons/fa";


function Dashboard(){

const {user}=useAuth();


const [stats,setStats]=useState({

total:0,
applied:0,
interview:0,
technical:0,
offer:0,
rejected:0

});




useEffect(()=>{


const loadStats=async()=>{

try{

const response=await api.get("/dashboard/stats");

setStats(response.data);


}catch(error){

console.error(
"Dashboard stats error",
error
);

}


};


loadStats();


},[]);






return(

<div style={styles.container}>


<h1 style={styles.title}>

Your Job Search Overview

</h1>


<p style={styles.subtitle}>

Track applications, manage resumes and find opportunities with AI.

</p>






<h2 style={styles.sectionTitle}>
Application Overview
</h2>





<div style={styles.statsGrid}>


<StatCard
icon={<FaBriefcase/>}
title="Total Jobs"
value={stats.total}
/>



<StatCard
icon={<FaClock/>}
title="Applied"
value={stats.applied}
/>




<StatCard
icon={<FaClock/>}
title="Interviews"
value={stats.interview}
/>




<StatCard
icon={<FaGift/>}
title="Offers"
value={stats.offer}
type="success"
/>




<StatCard
icon={<FaTimesCircle/>}
title="Rejected"
value={stats.rejected}
type="danger"
/>




</div>







<h2 style={styles.sectionTitle}>
Quick Actions
</h2>





<div style={styles.grid}>


<ActionCard

link="/jobs"

icon={<FaBriefcase/>}

title="My Jobs"

text={`${stats.total} jobs tracked`}

/>




<ActionCard

link="/resumes"

icon={<FaFileAlt/>}

title="My Resumes"

text="Manage your resumes"

/>




<ActionCard

link="/matches"

icon={<FaBullseye/>}

title="AI Matching"

text="Find best job matches"

/>



</div>



</div>


);

}








function StatCard({icon,title,value,type}){


return(

<div style={styles.statCard}>


<div

style={{
...styles.icon,
...(type==="success" && {color:"#22c55e"}),
...(type==="danger" && {color:"#ef4444"})
}}

>

{icon}

</div>


<p style={styles.number}>
{value}
</p>


<h3 style={styles.label}>
{title}
</h3>



</div>


);


}







function ActionCard({link,icon,title,text}){


return(

<Link

to={link}

style={styles.card}

>


<div style={styles.actionIcon}>

{icon}

</div>


<h3>
{title}
</h3>


<p>
{text}
</p>



</Link>


);


}









const styles={


container:{

padding:"30px",

maxWidth:"1200px",

margin:"0 auto"

},



title:{

color:"#111827",

fontSize:"32px",

marginBottom:"8px"

},



subtitle:{

color:"#64748b",

marginBottom:"35px"

},



sectionTitle:{

color:"#111827",

marginBottom:"20px"

},



statsGrid:{

display:"grid",

gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",

gap:"20px",

marginBottom:"40px"

},




statCard:{

background:"white",

padding:"20px",

borderRadius:"14px",

border:"1px solid #e5e7eb",

boxShadow:"0 4px 12px rgba(0,0,0,.06)",

textAlign:"center"

},



icon:{

fontSize:"28px",

color:"#38bdf8",

marginBottom:"10px"

},



number:{

fontSize:"34px",

fontWeight:"700",

margin:"0",

color:"#111827"

},



label:{

fontSize:"14px",

color:"#64748b"

},




grid:{

display:"grid",

gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",

gap:"20px"

},




card:{

background:"white",

padding:"25px",

borderRadius:"14px",

border:"1px solid #e5e7eb",

boxShadow:"0 4px 12px rgba(0,0,0,.06)",

textDecoration:"none",

color:"#111827"

},



actionIcon:{

fontSize:"30px",

color:"#38bdf8",

marginBottom:"10px"

}



};



export default Dashboard;