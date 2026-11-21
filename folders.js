window.renderMemberFolder = async function(options) {
  const { db, firestoreFns, targetUsername, uploaderName, containerId, cloudName, uploadPreset } = options;
  const { collection, addDoc, getDocs, deleteDoc, doc, query, where } = firestoreFns;
  const host = document.getElementById(containerId);
  if (!host) return;

  host.innerHTML =
    '<div class="card">' +
    '<h2>Personal Folder: ' + targetUsername + '</h2>' +
    '<div class="row">' +
    '<input type="text" id="fld-title-' + targetUsername + '" placeholder="File or Note Name" style="flex:1;" />' +
    '<input type="text" id="fld-url-' + targetUsername + '" placeholder="File URL or Upload..." style="flex:1;" />' +
    '<input type="file" id="fld-file-' + targetUsername + '" class="hidden" />' +
    '<button type="button" id="fld-up-' + targetUsername + '" class="btn btn-green">Upload File</button>' +
    '<button type="button" id="fld-save-' + targetUsername + '" class="btn">Save to Folder</button>' +
    '</div>' +
    '<p id="fld-stat-' + targetUsername + '" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;"></p>' +
    '<div id="fld-list-' + targetUsername + '">Loading folder...</div>' +
    '</div>';

  const fileIn = document.getElementById("fld-file-" + targetUsername);
  const statEl = document.getElementById("fld-stat-" + targetUsername);
  const listEl = document.getElementById("fld-list-" + targetUsername);

  document.getElementById("fld-up-" + targetUsername).onclick = function() { fileIn.click(); };

  fileIn.onchange = async function() {
    const file = fileIn.files.item(0);
    if (!file) return;
    statEl.textContent = "Uploading " + file.name + "...";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);
    const uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/auto/upload";
    const res = await fetch(uploadUrl, { method: "POST", body: fd });
    const data = await res.json();
    if (data.secure_url) {
      document.getElementById("fld-url-" + targetUsername).value = data.secure_url;
      if (!document.getElementById("fld-title-" + targetUsername).value) {
        document.getElementById("fld-title-" + targetUsername).value = file.name;
      }
      statEl.textContent = "Ready! Click Save to Folder.";
    }
  };

  async function refreshFolder() {
    listEl.innerHTML = "";
    const q = query(collection(db, "memberFolders"), where("owner", "==", targetUsername));
    const snap = await getDocs(q);
    snap.forEach(function(d) {
      const item = d.data();
      const row = document.createElement("div");
      row.className = "row";
      row.style.justifyContent = "space-between";
      row.style.borderBottom = "1px solid var(--border-color)";
      row.style.paddingBottom = "0.5rem";

      const info = document.createElement("div");
      const link = document.createElement("a");
      link.href = item.url || "#";
      link.target = "_blank";
      link.style.color = "#38bdf8";
      link.style.fontWeight = "600";
      link.textContent = item.title;
      const meta = document.createElement("span");
      meta.style.fontSize = "0.8rem";
      meta.style.color = "var(--text-muted)";
      meta.textContent = " (Added by " + item.addedBy + " • " + item.date + ")";
      info.appendChild(link);
      info.appendChild(meta);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-muted";
      delBtn.textContent = "Remove";
      delBtn.onclick = async function() {
        await deleteDoc(doc(db, "memberFolders", d.id));
        await refreshFolder();
      };

      row.appendChild(info);
      row.appendChild(delBtn);
      listEl.appendChild(row);
    });
    if (listEl.innerHTML === "") listEl.textContent = "Folder is currently empty.";
  }

  document.getElementById("fld-save-" + targetUsername).onclick = async function() {
    const title = document.getElementById("fld-title-" + targetUsername).value.trim();
    const url = document.getElementById("fld-url-" + targetUsername).value.trim();
    if (!title || !url) return alert("Enter a name and upload or paste a link.");
    await addDoc(collection(db, "memberFolders"), {
      owner: targetUsername,
      title: title,
      url: url,
      addedBy: uploaderName,
      date: new Date().toLocaleDateString()
    });
    document.getElementById("fld-title-" + targetUsername).value = "";
    document.getElementById("fld-url-" + targetUsername).value = "";
    statEl.textContent = "";
    await refreshFolder();
  };

  await refreshFolder();
};
