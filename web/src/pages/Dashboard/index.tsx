import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import api from '../../services/api';

interface Usuario {
  nome: string;
}

interface Resumo {
  total: number;
  ultimaAtividade: string | null;
}

function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [resumo, setResumo] = useState<Resumo>({ total: 0, ultimaAtividade: null });
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      fetchResumo();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchResumo = async () => {
    try {
      const response = await api.get('/registros', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const registros = response.data;
      setResumo({
        total: registros.length,
        ultimaAtividade: registros.length > 0 ? registros[0].criado_em : null
      });
    } catch (err) {
      console.error("Erro ao buscar resumo:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!usuario) return null;

  return (
    <div className="bg-dark text-white py-3 mb-4 shadow">
      <Container>
        <Row className="align-items-center">
          <Col md={4}>
            <h4 className="mb-0">Olá, <strong>{usuario.nome}</strong></h4>
          </Col>
          <Col md={5} className="text-center d-flex justify-content-around">
            <div>
              <small className="d-block text-muted text-uppercase">Total de Registros</small>
              <span className="h5">{resumo.total}</span>
            </div>
            {resumo.ultimaAtividade && (
              <div>
                <small className="d-block text-muted text-uppercase">Última Atividade</small>
                <span className="h6">{new Date(resumo.ultimaAtividade).toLocaleDateString()}</span>
              </div>
            )}
          </Col>
          <Col md={3} className="text-end">
            <Button color="outline-light" size="sm" onClick={handleLogout}>Sair</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;