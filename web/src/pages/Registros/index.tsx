import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input, ListGroup, ListGroupItem, Spinner, Alert, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import Dashboard from '../Dashboard'; // Usaremos o Dashboard como cabeçalho

interface Registro {
  id: string;
  registro: string;
  criado_em: string;
  data_alteracao: string[];
}

interface TranscricaoRegistrosProps {
  onApply: (texto: string) => void;
  disabled?: boolean;
}

const TranscricaoRegistros = ({ onApply, disabled = false }: TranscricaoRegistrosProps) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [transcricaoTemp, setTranscricaoTemp] = useState('');
  const [transcricaoEditada, setTranscricaoEditada] = useState('');
  const [transcricaoFinal, setTranscricaoFinal] = useState('');
  const [tempo, setTempo] = useState(0);
  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptionRef = useRef<string>('');
  const startTimeRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const encerrarReconhecimento = () => {
    pararRestartPeriodico();
    recognitionRef.current?.stop();
    limparStream();
  };

  const limparEstados = () => {
    setGravando(false);
    setPausado(false);
    setTranscricaoTemp('');
    setTranscricaoEditada('');
    setTranscricaoFinal('');
    transcriptionRef.current = '';
    setTempo(0);
    startTimeRef.current = null;
  };

  const limparStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const pararRestartPeriodico = () => {
    if (restartTimerRef.current) {
      clearInterval(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  const reiniciarReconhecimento = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (error) {
          console.warn('Falha ao reiniciar reconhecimento de voz', error);
        }
      }, 400);
    }
  };

  const iniciarRestartPeriodico = () => {
    pararRestartPeriodico();
    restartTimerRef.current = setInterval(() => {
      reiniciarReconhecimento();
    }, 30000);
  };

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
      .toString()
      .padStart(2, '0');
    const restante = (segundos % 60).toString().padStart(2, '0');
    return `${minutos}:${restante}`;
  };

  const iniciarGravacao = async () => {
    if (disabled) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.alert('Reconhecimento de voz não é suportado neste navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err) {
      window.alert('É necessário permitir acesso ao microfone para transcrever.');
      return;
    }

    transcriptionRef.current = '';
    setTranscricaoTemp('');
    setTranscricaoFinal('');
    setTranscricaoEditada('');
    setPausado(false);
    setTempo(0);
    startTimeRef.current = Date.now();

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'pt-BR';

    recognitionRef.current.onresult = (event: any) => {
      let parcial = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          parcial += result[0].transcript;
        }
      }

      if (final) {
        transcriptionRef.current += final;
      }

      setTranscricaoTemp(transcriptionRef.current + parcial);
    };

    recognitionRef.current.onerror = () => {
      reiniciarReconhecimento();
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      window.alert('Não foi possível iniciar a gravação de voz.');
      return;
    }
    iniciarRestartPeriodico();
    setGravando(true);
    setModalAberto(true);
  };

  const pausarGravacao = () => {
    setPausado(true);
    pararRestartPeriodico();
    recognitionRef.current?.stop();
    setTranscricaoFinal(transcriptionRef.current);
    setTranscricaoEditada(transcriptionRef.current);
  };

  const retomarGravacao = () => {
    setPausado(false);
    startTimeRef.current = Date.now() - tempo * 1000;
    transcriptionRef.current = transcricaoEditada;
    setTranscricaoTemp(transcricaoEditada);
    try {
      recognitionRef.current?.start();
    } catch (error) {
      console.warn('Não foi possível retomar a gravação', error);
    }
    iniciarRestartPeriodico();
  };

  const cancelar = () => {
    encerrarReconhecimento();
    setModalAberto(false);
    limparEstados();
  };

  const confirmar = () => {
    // Captura o texto mais recente, mesmo se ainda estiver gravando
    const textoAtual =
      (pausado ? transcricaoEditada : transcricaoTemp) ||
      transcricaoEditada ||
      transcricaoFinal ||
      transcriptionRef.current;

    encerrarReconhecimento();

    if (textoAtual.trim()) {
      onApply(textoAtual.trim());
    }

    setModalAberto(false);
    limparEstados();
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (gravando && !pausado) {
      const inicio = startTimeRef.current ? startTimeRef.current : Date.now();
      timer = setInterval(() => {
        const decorrido = Math.floor((Date.now() - inicio) / 1000);
        setTempo(decorrido);
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gravando, pausado]);

  useEffect(() => {
    return () => {
      pararRestartPeriodico();
      recognitionRef.current?.stop();
      limparStream();
    };
  }, []);

  return (
    <>
      <Button color="dark" size="sm" outline disabled={disabled} onClick={iniciarGravacao}>
        Gravar voz
      </Button>

      <Modal isOpen={modalAberto} toggle={cancelar} centered size="lg">
        <ModalHeader toggle={cancelar}>Transcrição por voz</ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="fw-bold">Tempo: {formatarTempo(tempo)}</div>
            <div className="d-flex gap-2">
              {gravando && (
                <Button
                  color={pausado ? 'success' : 'warning'}
                  outline
                  size="sm"
                  onClick={pausado ? retomarGravacao : pausarGravacao}
                >
                  <i className={pausado ? 'ri-play-line me-1' : 'ri-pause-line me-1'}></i>
                  {pausado ? 'Retomar' : 'Pausar'}
                </Button>
              )}
            </div>
          </div>

          <Input
            type="textarea"
            rows={8}
            value={pausado ? transcricaoEditada : transcricaoTemp || transcricaoFinal}
            onChange={(e) => setTranscricaoEditada(e.target.value)}
            disabled={gravando && !pausado}
            placeholder="Fale e acompanhe a transcrição aqui. Você pode pausar para editar."
          />

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button color="secondary" onClick={cancelar}>
              Cancelar
            </Button>
            <Button color="success" onClick={confirmar}>
              Inserir no registro
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

function RegistrosPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [registroSelecionado, setRegistroSelecionado] = useState<Registro | null>(null);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    setCarregando(true);
    try {
      const response = await api.get('/registros', config);
      setRegistros(response.data);
    } catch (err) {
      setErro('Falha ao carregar registros.');
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async () => {
    if (!texto.trim()) return;
    setSalvando(true);
    try {
      if (registroSelecionado) {
        // Atualizar
        await api.put(`/registros/${registroSelecionado.id}`, { registro: texto }, config);
      } else {
        // Criar novo
        await api.post('/registros', { registro: texto }, config);
      }
      setTexto('');
      setRegistroSelecionado(null);
      fetchRegistros(); // Atualiza a lista
    } catch (err) {
      setErro('Erro ao salvar o registro.');
    } finally {
      setSalvando(false);
    }
  };

  const selecionarRegistro = (reg: Registro) => {
    setRegistroSelecionado(reg);
    setTexto(reg.registro);
  };

  const novoRegistro = () => {
    setRegistroSelecionado(null);
    setTexto('');
  };

  const aplicarTranscricao = (textoTranscrito: string) => {
    setTexto(textoTranscrito);
  };

  return (
    <>
      <Dashboard />
      <Container fluid className="px-md-5">
        {erro && <Alert color="danger">{erro}</Alert>}
        <Row>
          {/* Lado Esquerdo - Lista */}
          <Col md={4} className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Meus Sonhos</h5>
                {/* <Button 
                  color="dark" 
                  size="sm" 
                  onClick={novoRegistro} 
                  className="btn-round"
                >
                  +
                </Button> */}
              </div>
            
            {carregando ? (
              <div className="text-center py-5"><Spinner color="primary" /></div>
            ) : (
              <ListGroup className="border-0 bg-transparent">
                {registros.map(reg => (
                  <ListGroupItem 
                    key={reg.id} 
                    action 
                    active={registroSelecionado?.id === reg.id}
                    onClick={() => selecionarRegistro(reg)}
                    className="shadow-sm p-3"
                  >
                    <div className="d-flex w-100 justify-content-between mb-1">
                      <small className={registroSelecionado?.id === reg.id ? 'text-white-50' : 'text-muted'}>
                        {format(new Date(reg.criado_em), "dd 'de' MMM", { locale: ptBR })}
                      </small>
                    </div>
                    <p className={`mb-0 text-truncate ${registroSelecionado?.id === reg.id ? 'text-white' : 'font-weight-bold'}`}>
                      {reg.registro}
                    </p>
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </Col>

          {/* Lado Direito - Editor */}
          <Col md={8}>
            <Card className="shadow-sm border-0" style={{ minHeight: '500px' }}>
              <CardBody className="d-flex flex-column p-4">
                <div className="mb-4">
                  <h5 className="font-weight-bold" style={{ color: 'var(--marrom-escuro)' }}>
                    {registroSelecionado ? 'Editando Registro' : 'Novo Registro'}
                  </h5>
                  {registroSelecionado && (
                    <small className="text-muted">
                      Criado em: {format(new Date(registroSelecionado.criado_em), "Pp", { locale: ptBR })}
                    </small>
                  )}
                  {!registroSelecionado && (
                    <small className="text-muted">
                      Registre seu estado mental ao redor do sonho
                    </small>
                  )}
                </div>
                
                <div className="position-relative flex-grow-1 mb-4">
                  <Input
                    type="textarea"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Descreva aqui seu sonho ou pensamento..."
                    className="registro-textarea h-100"
                    style={{ resize: 'none', paddingRight: '140px' }}
                  />
                  <div
                    className="position-absolute"
                    style={{ top: '12px', right: '12px' }}
                  >
                    <TranscricaoRegistros onApply={aplicarTranscricao} disabled={salvando} />
                  </div>
                </div>
                
                <div className="text-end">
                  {registroSelecionado && (
                    <Button color="link" className="text-muted me-3 text-decoration-none" onClick={novoRegistro}>
                      Cancelar
                    </Button>
                  )}
                  <Button 
                    color="dark" 
                    size="sm" 
                    disabled={salvando || !texto.trim()} 
                    onClick={handleSalvar}
                    className="px-5 shadow-sm"
                  >
                    {salvando ? <Spinner size="sm" /> : 'Salvar Registro'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default RegistrosPage;