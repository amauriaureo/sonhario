import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Button, Spinner } from 'reactstrap';

// Define a interface do usuário para tipagem
interface Usuario {
  id: string;
  nome: string;
  email: string;
}

function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    } else {
      // Se não encontrar usuário, redireciona para o login
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  if (!usuario) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner color="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <CardBody>
              <h2 className="text-center">Dashboard</h2>
              <hr />
              <h4>Olá, <strong>{usuario.nome}</strong>!</h4>
              <p>Seja bem-vindo ao seu painel Sonhário.</p>
              <p><strong>E-mail:</strong> {usuario.email}</p>
              <p><strong>ID:</strong> {usuario.id}</p>
              <Button color="danger" onClick={handleLogout} className="mt-3">
                Sair (Logout)
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;

