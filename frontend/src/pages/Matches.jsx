import { useState, useEffect } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";

import {
  FaBullseye,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb
} from "react-icons/fa";



function Matches(){


const [resumes,setResumes]=useState([]);

const [jobs,setJobs]=useState([]);

const [selectedResume,setSelectedResume]=useState("");

const [selectedJob,setSelectedJob]=useState("");

const [result,setResult]=useState(null);

const [loading,setLoading]=useState(true);

const [matching,setMatching]=useState(false);





useEffect(()=>{

loadData();

},[]);





const loadData=async()=>{


try{


const [resumeResponse,jobResponse]=await Promise.all([

api.get("/resumes/"),

api.get("/jobs/")

]);


setResumes(resumeResponse.data);

setJobs(jobResponse.data);



}catch(error){

console.error(error);


}finally{

setLoading(false);

}


};







const handleMatch=async()=>{


if(!selectedResume || !selectedJob){

alert("Please select resume and job");

return;

}



setMatching(true);

setResult(null);



try{


const response=await api.post(

`/matches/${selectedResume}/${selectedJob}`

);


setResult(response.data);



}catch(error){

console.error(error);

alert("Matching failed");


}finally{

setMatching(false);

}


};







if(loading)

return <div style={styles.loading}>Loading...</div>;






return(


<div style={styles.container}>


<BackButton/>




<h1 style={styles.title}>

<FaBullseye/>

AI Resume Matching

</h1>




<p style={styles.subtitle}>

Compare your resume with jobs using AI

</p>







<div style={styles.card}>


<label style={styles.label}>

Select Resume

</label>


<select

value={selectedResume}

onChange={(e)=>setSelectedResume(e.target.value)}

style={styles.select}

>


<option value="">

-- Choose Resume --

</option>



{

resumes.map(resume=>(

<option

key={resume.id}

value={resume.id}

>

{resume.filename}

</option>

))


}



</select>







<label style={styles.label}>

Select Job

</label>



<select

value={selectedJob}

onChange={(e)=>setSelectedJob(e.target.value)}

style={styles.select}

>


<option value="">

-- Choose Job --

</option>




{

jobs.map(job=>(


<option

key={job.id}

value={job.id}

>


{job.role} at {job.company}


</option>



))


}


</select>







<button

onClick={handleMatch}

disabled={matching}

style={styles.button}

>


<FaBullseye/>

{

matching

?

"Analyzing..."

:

"Match with AI"

}


</button>




</div>









{

result && (



<div style={styles.resultCard}>


<h2>

Match Result

</h2>





<div style={styles.score}>

{result.match_score}%

<p>Match</p>

</div>








<section>

<h3>

<FaCheckCircle/>

 Matching Skills

</h3>



<div style={styles.skills}>


{

result.matching_skills?.map((skill,index)=>(


<span

key={index}

style={styles.good}

>

{skill}

</span>


))


}


</div>


</section>







<section>


<h3>

<FaTimesCircle/>

 Missing Skills

</h3>



<div style={styles.skills}>


{

result.missing_skills?.map((skill,index)=>(


<span

key={index}

style={styles.bad}

>

{skill}

</span>



))


}



</div>


</section>








<section>


<h3>

<FaLightbulb/>

 Recommendation

</h3>


<p style={styles.recommendation}>

{result.recommendation}

</p>



</section>




</div>


)


}





</div>


);


}








const styles={



container:{

padding:"30px",

maxWidth:"900px",

margin:"0 auto"

},



title:{

display:"flex",

alignItems:"center",

gap:"10px",

color:"#1a1a2e"

},



subtitle:{

color:"#666",

marginBottom:"25px"

},



card:{

background:"white",

padding:"30px",

borderRadius:"10px",

boxShadow:"0 2px 8px rgba(0,0,0,0.08)"

},



label:{

display:"block",

fontWeight:"bold",

marginBottom:"8px",

marginTop:"15px"

},



select:{

width:"100%",

padding:"12px",

borderRadius:"6px",

border:"1px solid #ddd"

},



button:{

marginTop:"25px",

width:"100%",

padding:"14px",

background:"#4fc3f7",

color:"white",

border:"none",

borderRadius:"6px",

cursor:"pointer",

display:"flex",

justifyContent:"center",

alignItems:"center",

gap:"8px"

},



resultCard:{

marginTop:"25px",

background:"white",

padding:"30px",

borderRadius:"10px",

boxShadow:"0 2px 8px rgba(0,0,0,0.08)"

},



score:{

margin:"20px auto",

width:"120px",

height:"120px",

borderRadius:"50%",

border:"6px solid #4caf50",

display:"flex",

flexDirection:"column",

justifyContent:"center",

alignItems:"center",

fontSize:"32px",

fontWeight:"bold"

},



skills:{

display:"flex",

flexWrap:"wrap",

gap:"8px"

},



good:{

background:"#e8f5e9",

color:"#2e7d32",

padding:"6px 12px",

borderRadius:"15px"

},



bad:{

background:"#ffebee",

color:"#c62828",

padding:"6px 12px",

borderRadius:"15px"

},



recommendation:{

background:"#f5f5f5",

padding:"15px",

borderRadius:"8px"

},



loading:{

padding:"40px",

textAlign:"center"

}



};



export default Matches;