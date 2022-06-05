import React, { useState, useEffect } from "react";
import "./App.css";

import { API, Storage } from "aws-amplify";
import { listTodos } from "./graphql/queries";
import { createTodo, deleteTodo } from "./graphql/mutations";

import { withAuthenticator } from "@aws-amplify/ui-react";

const initialFormState = { name: "", description: "" };

function App({ signOut, user }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listTodos });
    const notesFromAPI = apiData.data.listNotes.items;
    // noteに関連した画像がある場合は取得する
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const image = await Storage.get(note.image);
          note.image = image;
        }
        return note;
      })
    );
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createTodo,
      variables: { input: formData },
    });
    // noteに関連した画像がある場合は配列に追加する
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([...notes, formData]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter((note) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteTodo,
      variables: { input: { id } },
    });
  }

  async function onChange(e) {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  return (
    <div className="App">
      <header>
        <h1>We now have Auth!</h1>
      </header>
      <h1>Hello {user.username}</h1>
      <h1>My Notes App</h1>
      <input
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Note description"
        value={formData.description}
      />
      <input type="file" onChange={onChange} />

      <button onClick={createNote}>Create Note</button>
      <div style={{ marginBottom: 30 }}>
        {notes.map((note) => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            {note.image && (
              <img src={note.image} style={{ width: 400 }} alt="" />
            )}
            <button onClick={() => deleteNote(note)}>Delete note</button>
          </div>
        ))}
      </div>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

// プラグインが提供する認証コンポーネントでラップする
export default withAuthenticator(App);
