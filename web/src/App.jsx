import { useEffect, useState } from 'react';
import axios from 'axios';
const BASE = 'http://localhost:4000/api';

function App() {
  const [list, setList] = useState([]);
  const fetchData = async () => {
    const { data } = await axios.get(`${BASE}/candidates`);
    setList(data);
  };
  useEffect(() => { fetchData(); }, []);

  const vote = async (id) => {
    try {
      await axios.post(`${BASE}/vote`, { candidateId: id }, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'error');
    }
  };

  const total = list.reduce((a, b) => a + b.votes, 0) || 1;
  return (
    <div style={{ padding: 40 }}>
      <h1>最简电子投票</h1>
      {list.map((c) => (
        <div key={c.id} style={{ marginBottom: 20 }}>
          <h3>{c.name}</h3>
          <p>{c.manifesto}</p>
          <button onClick={() => vote(c.id)}>投给TA</button>
          <div style={{ border: '1px solid #ccc', height: 20, width: 300, marginTop: 4 }}>
            <div
              style={{
                height: '100%',
                width: `${(c.votes / total) * 100}%`,
                background: '#4caf50',
              }}
            />
          </div>
          <span>{c.votes} 票</span>
        </div>
      ))}
    </div>
  );
}
export default App;