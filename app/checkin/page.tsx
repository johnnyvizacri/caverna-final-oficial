'use client'
import { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode' // Mudamos de Scanner para a classe base
import { supabase } from '../lib/supabase'

export default function Checkin() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [message, setMessage] = useState('Iniciando câmera...')
  const [statusColor, setStatusColor] = useState('bg-gray-800')
  const [hasPermission, setHasPermission] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    // Função para ligar a câmera na força
    async function startCamera() {
      try {
        // 1. Pede permissão explícita antes de tudo
        await navigator.mediaDevices.getUserMedia({ video: true })
        setHasPermission(true)
        
        // 2. Inicia o leitor
        const html5QrCode = new Html5Qrcode("reader")
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: "environment" }, // Tenta usar a câmera traseira/principal
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            onScanSuccess(decodedText)
          },
          (errorMessage) => {
            // Ignora erros de leitura de frame vazio
          }
        )
        setMessage('Aponte para o QR Code')
      } catch (err) {
        console.error("Erro ao iniciar câmera:", err)
        setMessage('⚠️ ERRO: Você precisa permitir o uso da câmera no navegador.')
        setStatusColor('bg-red-900')
      }
    }

    startCamera()

    // Limpeza quando sair da página
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => console.error(err))
      }
    }
  }, [])

  async function onScanSuccess(decodedText: string) {
    if(!scannerRef.current) return
    
    // Pausa momentânea
    try { await scannerRef.current.pause() } catch(e){}

    setScanResult(decodedText)
    setMessage('Verificando...')
    
    // Busca no banco
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*, events(title)')
      .eq('ticket_hash', decodedText)
      .single()

    if (!ticket) {
      setStatusColor('bg-red-600')
      setMessage('❌ INGRESSO INVÁLIDO')
    } else if (ticket.status === 'checked_in') {
      setStatusColor('bg-orange-600')
      setMessage(`⚠️ JÁ UTILIZADO!\n${ticket.customer_name}`)
    } else {
      await supabase
        .from('tickets')
        .update({ status: 'checked_in', checked_in_at: new Date() })
        .eq('id', ticket.id)

      setStatusColor('bg-green-600')
      setMessage(`✅ LIBERADO!\n${ticket.customer_name}`)
    }

    // Retoma depois de 3 segundos
    setTimeout(async () => {
      setStatusColor('bg-gray-800')
      setMessage('Pronto para o próximo...')
      setScanResult(null)
      try { await scannerRef.current?.resume() } catch(e){}
    }, 3000)
  }

  return (
    <div className={`min-h-screen ${statusColor} text-white p-4 transition-colors duration-500`}>
      <h1 className="text-2xl font-bold text-center mb-4 uppercase">Portaria Caverna</h1>
      
      {/* Área da Câmera */}
      <div className="bg-black rounded-xl overflow-hidden shadow-2xl mb-6 border-2 border-white/20 relative min-h-[300px]">
        {!hasPermission && <p className="text-center mt-10 p-4">Solicitando câmera...</p>}
        <div id="reader" className="w-full h-full"></div>
      </div>

      {/* Painel */}
      <div className="bg-black/30 backdrop-blur p-6 rounded-xl border border-white/20 text-center">
        <p className="text-xl font-bold whitespace-pre-line leading-relaxed">{message}</p>
      </div>
    </div>
  )
}