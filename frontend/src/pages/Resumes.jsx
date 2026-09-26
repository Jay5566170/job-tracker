import { useState, useEffect, useRef, useCallback } from "react";
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
const [loadError,setLoadError]=useState("");
const [preview,setPreview]=useState(null);

const fileInputRef=useRef(null);




const loadResumes=useCallback(async()=>{

try{

const response=await api.get("/resumes/");

setResumes(response.data);
setLoadError("");


}catch(requestError){

console.error(requestError);
setLoadError(requestError.response?.data?.detail || requestError.message || "Could not load resumes.");

}finally{

setLoading(false);

}

},[]);

useEffect(()=>{
void Promise.resolve().then(loadResumes);
},[loadResumes]);

useEffect(()=>()=> {
if(preview?.url){
URL.revokeObjectURL(preview.url);
}
},[preview]);





const handleUpload=async(e)=>{


const file=e.target.files?.[0];


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


const response=await api.post("/resumes/upload",formData);


fileInputRef.current.value="";


await loadResumes();
alert(response.data.extraction_error
  ? `Resume uploaded, but skills could not be extracted: ${response.data.extraction_error}`
  : "Resume uploaded and skills extracted successfully");



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


}catch{

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

const openResume=async(resume)=>{
  try{
    const response=await api.get(`/resumes/${resume.id}/file`,{
      responseType:"blob"
    });
    const fileUrl=URL.createObjectURL(response.data);
    setPreview({url:fileUrl,filename:resume.filename});
  }catch(error){
    console.error(error);
    alert(error.response?.data?.detail || error.message || "Could not open the resume.");
  }
};

const downloadResume=async(resume)=>{
  try{
    const response=await api.get(`/resumes/${resume.id}/file`,{
      responseType:"blob"
    });
    const fileUrl=URL.createObjectURL(response.data);
    const link=document.createElement("a");
    link.href=fileUrl;
    link.download=resume.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(fileUrl),1000);
  }catch(error){
    console.error(error);
    alert(error.response?.data?.detail || error.message || "Could not download the resume.");
  }
};





if(loading)

return <div style={styles.loading}>Loading...</div>;





return(

<>
<div style={styles.container}>


<BackButton/>




<h1 style={styles.title}>

<FaFileAlt/>

My Resumes

</h1>

{loadError && <p role="alert" style={{color:"#b91c1c"}}>{loadError}</p>}






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

{resume.extraction_error && (
  <p role="status" style={{color:"#92400e",fontSize:"13px"}}>
    Skills are unavailable: {resume.extraction_error}
  </p>
)}
{resume.summary && (
  <p style={{fontSize:"14px",lineHeight:1.5}}>
    <strong>Summary:</strong> {resume.summary}
  </p>
)}




<div style={styles.actions}>


<button
type="button"
onClick={()=>openResume(resume)}
style={styles.view}
>

<FaEye/>

View

</button>





<button
type="button"
onClick={()=>downloadResume(resume)}
style={styles.download}
>

<FaDownload/>

Download

</button>





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

{preview && (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={`Resume preview: ${preview.filename}`}
    style={styles.previewOverlay}
    onClick={(event)=>event.target===event.currentTarget && setPreview(null)}
  >
    <section style={styles.previewDialog}>
      <div style={styles.previewHeader}>
        <h2>{preview.filename}</h2>
        <button type="button" onClick={()=>setPreview(null)} style={styles.closePreview}>Close</button>
      </div>
      <iframe title={`Resume preview: ${preview.filename}`} src={preview.url} style={styles.previewFrame}/>
    </section>
  </div>
)}
</>

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

textDecoration:"none",
border:"none",
cursor:"pointer"
},



download:{

display:"flex",

alignItems:"center",

gap:"6px",

background:"#66bb6a",

color:"white",

padding:"8px 14px",

borderRadius:"5px",

textDecoration:"none",
border:"none",
cursor:"pointer"
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

},

previewOverlay:{
  position:"fixed",
  inset:0,
  zIndex:1000,
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  padding:"20px",
  background:"rgba(15,23,42,.7)"
},

previewDialog:{
  display:"flex",
  flexDirection:"column",
  width:"min(100%, 1000px)",
  height:"min(90vh, 900px)",
  background:"#fff",
  borderRadius:"10px",
  padding:"16px"
},

previewHeader:{
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  gap:"12px",
  marginBottom:"12px"
},

closePreview:{
  padding:"8px 14px",
  border:0,
  borderRadius:"6px",
  background:"#334155",
  color:"#fff",
  cursor:"pointer"
},

previewFrame:{
  flex:1,
  width:"100%",
  border:"1px solid #cbd5e1",
  borderRadius:"6px"
}


};



export default Resumes;