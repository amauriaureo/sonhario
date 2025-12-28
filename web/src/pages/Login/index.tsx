import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Card, CardBody, 
  Form, FormGroup, Label, Input, Button, 
  Alert, Spinner 
} from 'reactstrap';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ texto: '', cor: '' });

    // Lógica de login será implementada aqui no futuro
    console.log('Tentativa de login com:', { email, senha });
    
    // Simulação de chamada de API
    setTimeout(() => {
      setMensagem({ texto: 'Funcionalidade de login ainda não implementada.', cor: 'info' });
      setCarregando(false);
    }, 1500);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow">
            <CardBody>
              <h2 className="text-center mb-4 text-primary">Login no Sonhário</h2>
              {mensagem.texto && <Alert color={mensagem.cor}>{mensagem.texto}</Alert>}
              
              <Form onSubmit={handleLogin}>
                <FormGroup>
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <Label>Senha</Label>
                  <Input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
                </FormGroup>
                <Button color="primary" block disabled={carregando}>
                  {carregando ? <Spinner size="sm" /> : 'Entrar'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Link to="/cadastro">Não tem uma conta? Cadastre-se</Link>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

