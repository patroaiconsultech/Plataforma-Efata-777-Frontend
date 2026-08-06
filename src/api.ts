const BASE=(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/,"");
export async function api(path:string, init:RequestInit={}){
 const token=sessionStorage.getItem("orkio_access_token");
 const headers=new Headers(init.headers);
 headers.set("Content-Type","application/json");
 if(token) headers.set("Authorization",`Bearer ${token}`);
 const response=await fetch(`${BASE}${path}`,{...init,headers});
 if(!response.ok) throw new Error(`${response.status}:${await response.text()}`);
 return response.json();
}
export async function createInvite(threadId:string,payload:object){
 return api(`/api/v2/threads/${threadId}/invitations`,{method:"POST",body:JSON.stringify(payload)});
}
