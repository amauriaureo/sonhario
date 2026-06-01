const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

async function melhorarDescricaoSonho(descricaoOriginal) {
  if (!descricaoOriginal || descricaoOriginal.trim().length < 5) {
    throw new Error("Descrição muito curta para ser melhorada.");
  }

  const systemPrompt = `
Você é um assistente especializado em interpretação e escrita criativa de sonhos. 
Sua tarefa é pegar um relato de sonho (muitas vezes fragmentado ou simples) e expandi-lo, tornando-o mais vívido, sensorial e bem estruturado, mantendo a essência do que foi relatado.

Diretrizes:
1. Use uma linguagem evocativa e rica em detalhes sensoriais (visão, som, tato, emoção).
2. Organize o relato de forma fluida.
3. Não invente fatos que mudem o sentido do sonho, apenas embeleze e detalhe o que foi fornecido.
4. Mantenha o tom onírico e introspectivo.
5. O resultado deve ser apenas o texto do sonho melhorado, sem introduções ou comentários extras.
6. Responda sempre na linguagem fornecida pelo usuário.
7. Não tente explicar o significado das metáforas ou dos sentimentos; preserve o mistério e a ambiguidade natural dos sonhos.
8. Evite clichês literários ou estender o texto artificialmente no final. Termine assim que a ação ou o sentimento principal do relato original for concluído.
Relato original do usuário:
"{descricaoOriginal}"
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: descricaoOriginal,
        },
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || descricaoOriginal;
  } catch (error) {
    console.error("Erro ao chamar API do Groq:", error);
    throw new Error("Falha ao melhorar a descrição com IA.");
  }
}

module.exports = {
  melhorarDescricaoSonho,
};
