import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";

import {
  FaFileAlt,
  FaUpload,
  FaEye,
  FaDownload,
  FaTrash
} from "react-icons/fa";



function Resumes(){


const [resumes,setResumes]=useState([]);

const [loading,setLoading]=useState(true);

const [uploading,setUploading]=useState(false);

const fileInputRef=useRef(null);




useEffect(()=>{

loadResumes();

},[]);




const loadResumes=async()=>{

try{

const response=await api.get("/resumes/");

setResumes(response.data);


}catch(error){

console.error(error);

}finally{

setLoading(false);

}

};





const handleUpload=async(e)=>{


const file=e.target.files[0];


if(!file)
return;



if(
!file.name.toLowerCase().endsWith(".pdf") &&
!file.name.toLowerCase().endsWith(".txt")
){

alert("Only PDF and TXT files allowed");

return;

}



setUploading(true);



const formData=new FormData();

formData.append("file",file);



try{


await api.post("/resumes/upload",formData,{
headers:{
"Content-Type":"multipart/form-data"
}
});


alert("Resume uploaded successfully");


fileInputRef.current.value="";


loadResumes();



}catch(error){

console.error(error);

alert("Upload failed");


}finally{

setUploading(false);

}



};






const deleteResume=async(id)=>{


if(!window.confirm("Delete this resume?"))
return;



try{

await api.delete(`/resumes/${id}`);

loadResumes();


}catch(error){

alert("Delete failed");

}


};





const parseSkills=(skills)=>{


try{

return JSON.parse(skills || "[]");


}catch{

return [];

}


};





if(loading)

return <div style={styles.loading}>Loading...</div>;





return(


<div style={styles.container}>


<BackButton/>




<h1 style={styles.title}>

<FaFileAlt/>

My Resumes

</h1>






<div style={styles.uploadCard}>


<input

ref={fileInputRef}

type="file"

accept=".pdf,.txt"

onChange={handleUpload}

style={{display:"none"}}

/>




<button

onClick={()=>fileInputRef.current.click()}

style={styles.uploadButton}

disabled={uploading}

>


<FaUpload/>

{uploading ? "Uploading..." : "Upload Resume (PDF/TXT)"}


</button>



<p style={styles.hint}>

AI will extract your skills automatically

</p>



</div>







<div style={styles.grid}>


{


resumes.map(resume=>(



<div

key={resume.id}

style={styles.card}

>




<h3 style={styles.fileName}>

<FaFileAlt/>

{resume.filename}

</h3>





<p style={styles.date}>

Uploaded:

{" "}

{new Date(resume.created_at).toLocaleDateString()}

</p>






<p style={styles.label}>

Skills:

</p>



<div style={styles.skills}>


{

parseSkills(resume.skills).map((skill,index)=>(


<span

key={index}

style={styles.skill}

>

{skill}

</span>


))


}


</div>







<div style={styles.actions}>


<a

href={`http://127.0.0.1:8000/${resume.file_path}`}

target="_blank"

rel="noopener noreferrer"

style={styles.view}

>

<FaEye/>

View

</a>





<a

href={`http://127.0.0.1:8000/${resume.file_path}`}

download

style={styles.download}

>

<FaDownload/>

Download

</a>





<button

onClick={()=>deleteResume(resume.id)}

style={styles.delete}

>

<FaTrash/>

Delete

</button>



</div>




</div>



))


}



</div>



</div>


);


}







const styles={



container:{

padding:"30px",

maxWidth:"1200px",

margin:"0 auto"

},



title:{

display:"flex",

alignItems:"center",

gap:"10px",

color:"#1a1a2e",

marginBottom:"30px"

},



uploadCard:{

background:"white",

padding:"30px",

borderRadius:"10px",

textAlign:"center",

marginBottom:"30px",

boxShadow:"0 2px 8px rgba(0,0,0,0.08)"

},



uploadButton:{

display:"inline-flex",

alignItems:"center",

gap:"8px",

background:"#4fc3f7",

color:"white",

border:"none",

padding:"12px 22px",

borderRadius:"6px",

cursor:"pointer"

},



hint:{

color:"#666",

fontSize:"13px"

},



grid:{

display:"grid",

gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",

gap:"20px"

},



card:{

background:"white",

padding:"25px",

borderRadius:"10px",

boxShadow:"0 2px 8px rgba(0,0,0,0.08)"

},



fileName:{

display:"flex",

alignItems:"center",

gap:"8px"

},



date:{

color:"#999",

fontSize:"13px"

},



label:{

fontWeight:"bold"

},



skills:{

display:"flex",

flexWrap:"wrap",

gap:"6px"

},



skill:{

background:"#e3f2fd",

color:"#0d47a1",

padding:"5px 10px",

borderRadius:"15px",

fontSize:"12px"

},



actions:{

display:"flex",

gap:"10px",

marginTop:"20px"

},



view:{

display:"flex",

alignItems:"center",

gap:"6px",

background:"#4fc3f7",

color:"white",

padding:"8px 14px",

borderRadius:"5px",

textDecoration:"none"

},



download:{

display:"flex",

alignItems:"center",

gap:"6px",

background:"#66bb6a",

color:"white",

padding:"8px 14px",

borderRadius:"5px",

textDecoration:"none"

},



delete:{

display:"flex",

alignItems:"center",

gap:"6px",

background:"#ef5350",

color:"white",

border:"none",

padding:"8px 14px",

borderRadius:"5px",

cursor:"pointer"

},



loading:{

padding:"40px",

textAlign:"center"

}


};



export default Resumes;