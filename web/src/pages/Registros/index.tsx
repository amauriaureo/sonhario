import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input, Spinner, Alert, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import Dashboard from '../Dashboard'; // Usaremos o Dashboard como cabeçalho
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiCheck, FiMic } from 'react-icons/fi';

interface Registro {
  id: string;
  registro: string;
  criado_em: string;
  data_alteracao: string[];
}

interface TranscricaoRegistrosProps {
  onApply: (texto: string) => void;
  disabled?: boolean;
  currentText?: string;
}

const TranscricaoRegistros = ({
  onApply,
  disabled = false,
  currentText = '',
}: TranscricaoRegistrosProps) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [etapa, setEtapa] = useState<'choose' | 'record'>('record');
  const [modoAplicacao, setModoAplicacao] = useState<'replace' | 'append'>('replace');
  const baseTextRef = useRef<string>('');
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
    setEtapa('record');
  };

  const pausarGravacao = () => {
    setPausado(true);
    pararRestartPeriodico();
    recognitionRef.current?.stop();
    // Captura o texto completo visível no momento (inclui resultados parciais)
    const textoAtual = transcricaoTemp || transcriptionRef.current;
    setTranscricaoFinal(textoAtual);
    setTranscricaoEditada(textoAtual);
    // Atualiza a referência para que ao retomar continue do ponto correto
    transcriptionRef.current = textoAtual;
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
    setEtapa('record');
    setModoAplicacao('replace');
    baseTextRef.current = '';
    limparEstados();
  };

  const juntarTexto = (base: string, extra: string) => {
    const b = (base || '').trim();
    const e = (extra || '').trim();
    if (!b) return e;
    if (!e) return b;
    return `${b}\n\n${e}`;
  };

  const confirmar = () => {
    // Captura o texto mais recente, mesmo se ainda estiver gravando
    const textoAtual =
      (pausado ? transcricaoEditada : transcricaoTemp) ||
      transcricaoEditada ||
      transcricaoFinal ||
      transcriptionRef.current;

    encerrarReconhecimento();

    const transcrito = (textoAtual || '').trim();
    if (transcrito) {
      if (modoAplicacao === 'append') {
        onApply(juntarTexto(baseTextRef.current, transcrito));
      } else {
        onApply(transcrito);
      }
    }

    setModalAberto(false);
    setEtapa('record');
    setModoAplicacao('replace');
    baseTextRef.current = '';
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
      <Button
        color="link"
        className="p-0 text-muted"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;

          const temConteudo = (currentText || '').trim().length > 0;
          setModalAberto(true);

          if (temConteudo) {
            // Mostra escolha dentro do próprio modal
            setEtapa('choose');
          } else {
            // Sem conteúdo: comportamento atual (substituir)
            baseTextRef.current = '';
            setModoAplicacao('replace');
            setEtapa('record');
            iniciarGravacao();
          }
        }}
        title="Gravar"
        aria-label="Gravar"
        style={{ textDecoration: 'none' }}
      >
        <FiMic size={18} />
      </Button>

      <Modal isOpen={modalAberto} toggle={cancelar} centered size="lg">
        <ModalHeader toggle={cancelar}>Transcrição por voz</ModalHeader>
        <ModalBody>
          {etapa === 'choose' ? (
            <div className="py-3">
              <div className="mb-3">
                <div className="fw-semibold mb-1">
                  Você deseja substituir o registro ou adicionar mais detalhes?
                </div>
                <div className="text-muted small">
                  Essa escolha não salva automaticamente — apenas define como a transcrição será inserida no editor.
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  color="secondary"
                  onClick={() => {
                    // Substitui: comportamento atual
                    baseTextRef.current = '';
                    setModoAplicacao('replace');
                    setEtapa('record');
                    iniciarGravacao();
                  }}
                >
                  Substituir
                </Button>
                <Button
                  color="dark"
                  onClick={() => {
                    // Adiciona: concatena com o texto do editor no momento do clique
                    baseTextRef.current = currentText || '';
                    setModoAplicacao('append');
                    setEtapa('record');
                    iniciarGravacao();
                  }}
                >
                  Adicionar mais detalhes
                </Button>
              </div>
            </div>
          ) : (
            <>
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
                      <i
                        className={pausado ? 'ri-play-line me-1' : 'ri-pause-line me-1'}
                      ></i>
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
            </>
          )}
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
  const [deletando, setDeletando] = useState(false);
  const [erro, setErro] = useState('');
  const [modalRegistroAberto, setModalRegistroAberto] = useState(true);
  const [modoModal, setModoModal] = useState<'view' | 'edit'>('view');
  const [confirmandoDelete, setConfirmandoDelete] = useState(false);
  const textoOriginalRef = useRef<string>('');

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  useEffect(() => {
    abrirNovoRegistro();
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
      textoOriginalRef.current = '';
      setRegistroSelecionado(null);
      setModalRegistroAberto(false);
      fetchRegistros(); // Atualiza a lista
    } catch (err) {
      setErro('Erro ao salvar o registro.');
    } finally {
      setSalvando(false);
    }
  };

  const abrirNovoRegistro = () => {
    setRegistroSelecionado(null);
    setTexto('');
    textoOriginalRef.current = '';
    setModoModal('edit');
    setConfirmandoDelete(false);
    setModalRegistroAberto(true);
  };

  const abrirEdicaoRegistro = (reg: Registro) => {
    setRegistroSelecionado(reg);
    setTexto(reg.registro || '');
    textoOriginalRef.current = reg.registro || '';
    setModoModal('edit');
    setConfirmandoDelete(false);
    setModalRegistroAberto(true);
  };

  const abrirVisualizacaoRegistro = (reg: Registro) => {
    setRegistroSelecionado(reg);
    setTexto(reg.registro || '');
    textoOriginalRef.current = reg.registro || '';
    setModoModal('view');
    setConfirmandoDelete(false);
    setModalRegistroAberto(true);
  };

  const abrirDeleteRegistro = (reg: Registro) => {
    setRegistroSelecionado(reg);
    setTexto(reg.registro || '');
    setModoModal('view');
    setConfirmandoDelete(true);
    setModalRegistroAberto(true);
  };

  const fecharModalRegistro = () => {
    if (salvando || deletando) return;
    setModalRegistroAberto(false);
    setConfirmandoDelete(false);
    setModoModal('view');
  };

  const aplicarTranscricao = (textoTranscrito: string) => {
    setTexto(textoTranscrito);
  };

  const handleDeletar = async () => {
    if (!registroSelecionado?.id) return;
    setDeletando(true);
    try {
      await api.delete(`/registros/${registroSelecionado.id}`, config);
      setModalRegistroAberto(false);
      setRegistroSelecionado(null);
      setConfirmandoDelete(false);
      setModoModal('view');
      fetchRegistros();
    } catch (err) {
      setErro('Erro ao deletar o registro.');
    } finally {
      setDeletando(false);
    }
  };

  const isNovo = !registroSelecionado;
  const textoAtualNormalizado = texto.trim();
  const textoOriginalNormalizado = textoOriginalRef.current.trim();
  const textoFoiAlterado = isNovo
    ? textoAtualNormalizado.length > 0
    : textoAtualNormalizado !== textoOriginalNormalizado;

  return (
    <>
      <Dashboard />
      <Container fluid className="px-3 py-4">
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          {erro && <Alert color="danger">{erro}</Alert>}

          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h4 className="mb-0" style={{ color: 'var(--marrom-escuro)' }}>Meus Sonhos</h4>
              <small className="text-muted">Clique em um card para visualizar. Use os ícones para editar/deletar.</small>
            </div>
            <Button color="dark" onClick={abrirNovoRegistro}>
              <FiPlus className="me-2" />
              Novo Registro
            </Button>
          </div>

          <Row className="g-3">
            <Col lg={12}>
              {carregando ? (
                <div className="text-center py-5"><Spinner color="primary" /></div>
              ) : (
                <>
                  {registros.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardBody className="p-4">
                        <div className="text-muted">Você ainda não possui registros.</div>
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {registros.map((reg) => (
                        <Card
                          key={reg.id}
                          className="border-0 shadow-sm"
                          role="button"
                          onClick={() => abrirVisualizacaoRegistro(reg)}
                          style={{ cursor: 'pointer' }}
                        >
                          <CardBody className="p-3 p-md-4">
                            <div className="d-flex align-items-start justify-content-between gap-3">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <small className="text-muted">
                                    {format(new Date(reg.criado_em), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                  </small>
                                </div>
                                <div
                                  className="text-body"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {reg.registro}
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                <Button
                                  color="link"
                                  className="p-0 text-muted"
                                  title="Editar"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirEdicaoRegistro(reg);
                                  }}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <FiEdit2 size={18} />
                                </Button>
                                <Button
                                  color="link"
                                  className="p-0 text-danger"
                                  title="Deletar"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirDeleteRegistro(reg);
                                  }}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <FiTrash2 size={18} />
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Col>
          </Row>
        </div>
      </Container>

      {/* Modal único: Visualizar / Editar / Novo (condicionais) */}
      <Modal
        isOpen={modalRegistroAberto}
        toggle={fecharModalRegistro}
        // centered
        size="xl"
        backdrop={salvando || deletando ? 'static' : true}
        keyboard={!(salvando || deletando)}
      >
        <ModalHeader toggle={fecharModalRegistro}>
          {registroSelecionado
            ? modoModal === 'edit'
              ? 'Editar Registro'
              : 'Visualizar Registro'
            : 'Novo Registro'}
        </ModalHeader>

        <ModalBody>
          {registroSelecionado?.criado_em && (
            <div className="mb-3">
              <small className="text-muted">
                Criado em:{' '}
                {format(new Date(registroSelecionado.criado_em), "Pp", { locale: ptBR })}
              </small>
            </div>
          )}

          {confirmandoDelete && registroSelecionado && modoModal === 'view' && (
            <Alert color="danger" className="mb-3">
              Essa ação é irreversível. Confirma deletar este registro?
            </Alert>
          )}

          {modoModal === 'view' ? (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {registroSelecionado?.registro || ''}
            </div>
          ) : (
            <div className="position-relative">
              <Input
                type="textarea"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Registre seu estado mental ao redor do sonho."
                className="border-0 shadow-none bg-transparent"
                style={{
                  cursor: 'text',
                  color: '#212529',
                  backgroundColor: 'transparent',
                  padding: '6px 0',
                  minHeight: 400,
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  resize: 'none',
                  paddingRight: '140px',
                }}
                disabled={salvando}
              />
              <div className="position-absolute" style={{ top: '12px', right: '12px' }}>
                <TranscricaoRegistros
                  onApply={aplicarTranscricao}
                  disabled={salvando}
                  currentText={texto}
                />
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="d-flex justify-content-between align-items-center">
          {modoModal === 'view' ? (
            <>
              {/* <Button
                color="secondary"
                onClick={() => {
                  setConfirmandoDelete(false);
                  fecharModalRegistro();
                }}
                disabled={deletando}
              >
                Fechar
              </Button> */}
              <div></div>

              <div className="d-flex align-items-center gap-2">
                {/* Ícones no final do modal (rodapé), à direita */}
                {registroSelecionado && (
                  <>
                    <Button
                      color="link"
                      className="p-0 text-muted"
                      title="Editar"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmandoDelete(false);
                        setModoModal('edit');
                      }}
                      style={{ textDecoration: 'none' }}
                      disabled={deletando}
                    >
                      <FiEdit2 size={18} />
                    </Button>
                    <Button
                      color="link"
                      className="p-0 text-danger"
                      title="Deletar"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmandoDelete(true);
                      }}
                      style={{ textDecoration: 'none' }}
                      disabled={deletando}
                    >
                      <FiTrash2 size={18} />
                    </Button>
                  </>
                )}

                {registroSelecionado && confirmandoDelete && (
                  <Button
                    color="danger"
                    onClick={handleDeletar}
                    disabled={deletando}
                  >
                    {deletando ? <Spinner size="sm" /> : 'Deletar'}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div />

              <div className="d-flex align-items-center gap-2">
                {registroSelecionado && (
                  <Button
                    color="link"
                    className="p-0 text-muted"
                    title="Visualizar"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setModoModal('view');
                      setConfirmandoDelete(false);
                    }}
                    style={{ textDecoration: 'none' }}
                    disabled={salvando}
                    aria-label="Visualizar"
                  >
                    <FiEye size={18} />
                  </Button>
                )}

                <Button
                  color="link"
                  className="p-0 text-success"
                  title="Salvar"
                  onClick={handleSalvar}
                  disabled={salvando || !textoFoiAlterado}
                  style={{ textDecoration: 'none' }}
                  aria-label="Salvar"
                >
                  {salvando ? <Spinner size="sm" /> : <FiCheck size={20} />}
                </Button>
              </div>
            </>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
}

export default RegistrosPage;