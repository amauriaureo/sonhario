import { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert } from 'reactstrap';
import api from './services/api';

// Definindo o tipo do Usuário para o TypeScript
interface Usuario {
  id: string;
  nome: string;
  email: string;
}

function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    // Chamada para a sua API Node
    api.get('/usuarios')
      .then(response => {
        setUsuarios(response.data);
        setCarregando(false);
      })
      .catch(err => {
        console.error(err);
        setErro("Não foi possível carregar os usuários.");
        setCarregando(false);
      });
  }, []);

  return (
    <Container className="mt-5">
      <h1 className="mb-4 text-primary">Sonhário - Lista de Usuários</h1>
      
      {erro && <Alert color="danger">{erro}</Alert>}

      {carregando ? (
        <div className="text-center">
          <Spinner color="primary" />
          <p>Buscando dados no Supabase...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td className="small text-muted">{user.id}</td>
                <td><strong>{user.nome}</strong></td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default App;