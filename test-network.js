console.log("start");
fetch("https://ocdeqgksepeoplbxwplw.supabase.co/rest/v1/", { headers: { apikey: "test" } })
  .then((res) => console.log("got response, status:", res.status))
  .catch((err) => console.log("caught error:", err));
console.log("after fetch call (sync line)");
setTimeout(() => console.log("still alive after 5 seconds"), 5000);