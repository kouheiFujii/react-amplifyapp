import React, { useState, useEffect } from "react";
import "./App.css";

import { API } from "aws-amplify";
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
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createTodo,
      variables: { input: formData },
    });
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
      <button onClick={createNote}>Create Note</button>
      <div style={{ marginBottom: 30 }}>
        {notes.map((note) => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
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
