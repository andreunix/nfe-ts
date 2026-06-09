import { SefazEnvironment, InvoiceModel } from "../../fiscal-core/types/enums.ts";
import { getStateCode } from "../../fiscal-core/state_codes.ts";
import { getMdfeServiceMeta, MdfeService, getMdfeServiceUrlKey } from "../mdfe/index.ts";
import { getCteServiceMeta, CteService, getCteServiceUrlKey } from "../cte/index.ts";
import { buildEnvelope as buildMdfeEnvelope, buildEnvelopeCompressed as buildMdfeEnvelopeCompressed, buildAction as buildMdfeAction } from "../mdfe/soap.ts";
import { buildEnvelope as buildCteEnvelope, buildEnvelopeCompressed as buildCteEnvelopeCompressed, buildEnvelopeNamed as buildCteEnvelopeNamed, buildAction as buildCteAction } from "../cte/soap.ts";
import { buildEnvelope, buildEnvelopeCompressed, buildEnvelopeDistDfe, buildEnvelopeWithHeader, buildAction } from "../soap.ts";
import { getServiceMeta, getServiceUrlKey, SefazService } from "../services.ts";
import { getSefazUrl, getSefazUrlForModel, getAnUrl } from "../urls/index.ts";
import { getMdfeUrl } from "../mdfe/urls.ts";
import { getCteUrl } from "../cte/urls.ts";
import * as rb from "../request_builders/index.ts";
import * as mdfeRb from "../mdfe/request_builders.ts";
import * as cteRb from "../cte/request_builders.ts";
import * as cteEvents from "../cte/events.ts";
import * as mdfeEvents from "../mdfe/events.ts";
import { validateRequestXml } from "../validate.ts";

/** Resposta bruta HTTP/SOAP da SEFAZ. */
export interface SefazRawResponse {
  status: number;
  body: string;
  url: string;
  action: string;
}

/** Resposta simplificada de autorização BP-e. */
export interface BpeAuthResponse extends SefazRawResponse {}

/** Resposta simplificada NFSe. */
export interface NfseResponse extends SefazRawResponse {
  isAuthorized(): boolean;
  is_authorized(): boolean;
}

/** Cliente de transporte SEFAZ em TypeScript. */
export class SefazClient {
  constructor(
    readonly pfxBuffer?: Uint8Array,
    readonly passphrase?: string,
    readonly fetchImpl: typeof fetch = fetch,
  ) {}

  /** Cria cliente com o mesmo formato do Rust (`new(pfx, senha)`). */
  static new(pfxBuffer: Uint8Array, passphrase: string): SefazClient {
    return new SefazClient(pfxBuffer, passphrase);
  }

  /** Envia XML já montado para um serviço NF-e/NFC-e. */
  async send(uf: string, environment: SefazEnvironment, service: SefazService, requestXml: string, compressed = false): Promise<SefazRawResponse> {
    const meta = getServiceMeta(service);
    const url = getSefazUrl(uf, environment, getServiceUrlKey(service));
    if (!url) throw new Error(`SEFAZ URL not found for ${uf}/${service}`);
    const envelope = service === SefazService.DistribuicaoDFe
      ? buildEnvelopeDistDfe(requestXml, "AN", meta)
      : service === SefazService.ConsultaCadastro
        ? buildEnvelopeWithHeader(requestXml, uf, meta)
        : compressed
          ? buildEnvelopeCompressed(requestXml, uf, meta)
          : buildEnvelope(requestXml, uf, meta);
    return this.post(url, buildAction(meta), envelope);
  }

  /** Envia XML escolhendo endpoints por modelo 55/65. */
  async sendModel(uf: string, environment: SefazEnvironment, service: SefazService, model: InvoiceModel | number, requestXml: string, compressed = false): Promise<SefazRawResponse> {
    const meta = getServiceMeta(service);
    const url = getSefazUrlForModel(uf, environment, getServiceUrlKey(service), model);
    if (!url) throw new Error(`SEFAZ URL not found for ${uf}/${service}/model ${model}`);
    const envelope = compressed ? buildEnvelopeCompressed(requestXml, uf, meta) : buildEnvelope(requestXml, uf, meta);
    return this.post(url, buildAction(meta), envelope);
  }

  /** Valida XML de requisição antes do envio. */
  sefazValidate(xml: string, version: string, method: string): void {
    validateRequestXml(xml, version, method);
  }

  async status(uf: string, environment: SefazEnvironment): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.StatusServico, rb.buildStatusRequest(uf, environment));
  }

  async authorize(uf: string, environment: SefazEnvironment, signedXml: string, lotId = "1", sync = true): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.Autorizacao, rb.buildAutorizacaoRequest(signedXml, lotId, sync), false);
  }

  async authorizeCompressed(uf: string, environment: SefazEnvironment, signedXml: string, lotId = "1", sync = true): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.Autorizacao, rb.buildAutorizacaoRequest(signedXml, lotId, sync, true), true);
  }

  async authorizeNfce(uf: string, environment: SefazEnvironment, signedXml: string, lotId = "1", sync = true): Promise<SefazRawResponse> {
    return this.sendModel(uf, environment, SefazService.Autorizacao, InvoiceModel.Nfce, rb.buildAutorizacaoRequest(signedXml, lotId, sync));
  }

  async authorizeNfceCompressed(uf: string, environment: SefazEnvironment, signedXml: string, lotId = "1", sync = true): Promise<SefazRawResponse> {
    return this.sendModel(uf, environment, SefazService.Autorizacao, InvoiceModel.Nfce, rb.buildAutorizacaoRequest(signedXml, lotId, sync, true), true);
  }

  async authorizeContingency(uf: string, environment: SefazEnvironment, signedXml: string, lotId = "1"): Promise<SefazRawResponse> {
    return this.authorize(uf, environment, signedXml, lotId, true);
  }

  async authorizeBatch(uf: string, environment: SefazEnvironment, xmls: string[], lotId = "1", indSinc = 0): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.Autorizacao, rb.buildAutorizacaoBatchRequest(xmls, lotId, indSinc));
  }

  async authorizeBatchCompressed(uf: string, environment: SefazEnvironment, xmls: string[], lotId = "1", indSinc = 0): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.Autorizacao, rb.buildAutorizacaoBatchRequest(xmls, lotId, indSinc), true);
  }

  async authorizeBatchNfce(uf: string, environment: SefazEnvironment, xmls: string[], lotId = "1", indSinc = 0): Promise<SefazRawResponse> {
    return this.sendModel(uf, environment, SefazService.Autorizacao, InvoiceModel.Nfce, rb.buildAutorizacaoBatchRequest(xmls, lotId, indSinc));
  }

  async consultReceipt(uf: string, environment: SefazEnvironment, receipt: string): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RetAutorizacao, rb.buildConsultaReciboRequest(receipt, environment));
  }

  async consult(uf: string, environment: SefazEnvironment, accessKey: string): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.ConsultaProtocolo, rb.buildConsultaRequest(accessKey, environment));
  }

  async cancel(uf: string, environment: SefazEnvironment, accessKey: string, protocol: string, justification: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildCancelaRequest(accessKey, protocol, justification, seq, environment, taxId));
  }

  async cce(uf: string, environment: SefazEnvironment, accessKey: string, correction: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildCceRequest(accessKey, correction, seq, environment, taxId));
  }

  async inutilize(uf: string, environment: SefazEnvironment, year: number, taxId: string, model: string, series: number, startNumber: number, endNumber: number, justification: string): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.Inutilizacao, rb.buildInutilizacaoRequest(year, taxId, model, series, startNumber, endNumber, justification, environment, uf));
  }

  async manifest(environment: SefazEnvironment, accessKey: string, eventType: string, taxId: string, justification?: string, seq = 1): Promise<SefazRawResponse> {
    return this.send("AN", environment, SefazService.RecepcaoEvento, rb.buildManifestaRequest(accessKey, eventType, justification, seq, environment, taxId));
  }

  async distDfe(uf: string, environment: SefazEnvironment, taxId: string, nsu?: string, accessKey?: string): Promise<SefazRawResponse> {
    return this.send("AN", environment, SefazService.DistribuicaoDFe, rb.buildDistDfeRequest(uf, taxId, nsu, accessKey, environment));
  }

  async cadastro(uf: string, environment: SefazEnvironment, searchType: string, searchValue: string): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.ConsultaCadastro, rb.buildCadastroRequest(uf, searchType, searchValue));
  }

  async epec(environment: SefazEnvironment, data: rb.EpecData): Promise<SefazRawResponse> {
    return this.send("AN", environment, SefazService.RecepcaoEPEC, rb.buildEpecRequest(data, environment));
  }

  async epecNfceStatus(uf: string, environment: SefazEnvironment): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.EpecNfceStatusServico, rb.buildEpecNfceStatusRequest(uf, environment));
  }

  async epecNfce(uf: string, environment: SefazEnvironment, data: rb.EpecNfceData): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEpecNfce, rb.buildEpecNfceRequest(data, environment));
  }

  async download(environment: SefazEnvironment, requestXml: string): Promise<SefazRawResponse> {
    const meta = getServiceMeta(SefazService.NfeDownloadNF);
    const url = getAnUrl(environment, getServiceUrlKey(SefazService.NfeDownloadNF));
    if (!url) throw new Error("AN download URL not found");
    return this.post(url, buildAction(meta), buildEnvelope(requestXml, "AN", meta));
  }

  async csc(uf: string, environment: SefazEnvironment, indOp: number, cnpj: string, cscId?: string, cscCode?: string): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.CscNFCe, rb.buildCscRequest(environment, indOp, cnpj, cscId, cscCode));
  }

  async eventBatch(uf: string, environment: SefazEnvironment, events: rb.EventItem[], lotId?: string): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildEventBatchRequest(uf, events, lotId, environment));
  }

  async manifestBatch(environment: SefazEnvironment, events: rb.EventItem[], lotId?: string): Promise<SefazRawResponse> {
    return this.eventBatch("AN", environment, events, lotId);
  }

  async conciliacao(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, detPag: rb.ConciliacaoDetPag[], taxId: string, cancel = false, cancelProtocol?: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildConciliacaoRequest(accessKey, verAplic, detPag, cancel, cancelProtocol, seq, environment, taxId, getStateCode(uf)));
  }

  async cteStatus(uf: string, environment: SefazEnvironment): Promise<SefazRawResponse> {
    const meta = getCteServiceMeta(CteService.StatusServico);
    return this.sendCte(uf, environment, CteService.StatusServico, cteRb.buildCteStatusRequest(getStateCode(uf), environment), meta);
  }

  async cteConsult(uf: string, environment: SefazEnvironment, accessKey: string): Promise<SefazRawResponse> {
    return this.sendCte(uf, environment, CteService.Consulta, cteRb.buildCteConsultaRequest(accessKey, environment));
  }

  async cteAuthorize(uf: string, environment: SefazEnvironment, signedXml: string): Promise<SefazRawResponse> {
    return this.sendCte(uf, environment, CteService.RecepcaoSinc, cteRb.buildCteRecepcaoSincPayload(signedXml), undefined, true);
  }

  async cteRecepcaoGtve(uf: string, environment: SefazEnvironment, requestXml: string): Promise<SefazRawResponse> {
    const meta = getCteServiceMeta(CteService.RecepcaoGTVe);
    const url = getCteUrl(uf, environment, getCteServiceUrlKey(CteService.RecepcaoGTVe));
    if (!url) throw new Error("CT-e GTVe URL not found");
    return this.post(url, buildCteAction(meta), buildCteEnvelopeNamed(requestXml, meta, "gtveDadosMsg"));
  }

  async cteRecepcaoEvento(uf: string, environment: SefazEnvironment, eventXml: string): Promise<SefazRawResponse> {
    return this.sendCte(uf, environment, CteService.RecepcaoEvento, eventXml);
  }

  async mdfeStatus(uf: string, environment: SefazEnvironment): Promise<SefazRawResponse> {
    return this.sendMdfe(uf, environment, MdfeService.StatusServico, mdfeRb.buildMdfeStatusRequest(environment));
  }

  async mdfeConsult(uf: string, environment: SefazEnvironment, accessKey: string): Promise<SefazRawResponse> {
    return this.sendMdfe(uf, environment, MdfeService.Consulta, mdfeRb.buildMdfeConsultaRequest(accessKey, environment));
  }

  async mdfeAuthorize(uf: string, environment: SefazEnvironment, signedXml: string, lotId = "1"): Promise<SefazRawResponse> {
    return this.sendMdfe(uf, environment, MdfeService.RecepcaoSinc, mdfeRb.buildMdfeRecepcaoSincPayload(signedXml, lotId), true);
  }

  async mdfeRecepcaoEvento(uf: string, environment: SefazEnvironment, eventXml: string): Promise<SefazRawResponse> {
    return this.sendMdfe(uf, environment, MdfeService.RecepcaoEvento, eventXml);
  }

  buildCteCancelamento = cteEvents.buildCteCancelamento;
  buildCteCce = cteEvents.buildCteCce;
  buildCteDesacordo = cteEvents.buildCteDesacordo;
  buildMdfeEncerramento = mdfeEvents.buildMdfeEncerramento;
  buildMdfeCancelamento = mdfeEvents.buildMdfeCancelamento;
  buildMdfeInclusaoCondutor = mdfeEvents.buildMdfeInclusaoCondutor;
  buildMdfeInclusaoDfe = mdfeEvents.buildMdfeInclusaoDfe;

  async nfseRecepcao(url: string, xml: string): Promise<NfseResponse> {
    return this.nfseRecepcaoUrl(url, xml);
  }

  async nfseRecepcaoUrl(url: string, xml: string): Promise<NfseResponse> {
    const res = await this.post(url, "", xml);
    const isAuthorized = () => res.body.includes("<CodigoVerificacao>") || res.body.includes("<InfNfse");
    return { ...res, isAuthorized, is_authorized: isAuthorized };
  }

  async nfseEvento(url: string, xml: string): Promise<NfseResponse> {
    return this.nfseRecepcaoUrl(url, xml);
  }

  async httpsGet(url: string): Promise<[number, string]> {
    const res = await this.fetchImpl(url);
    return [res.status, await res.text()];
  }

  async nfseConsulta(url: string): Promise<NfseResponse> {
    const [status, body] = await this.httpsGet(url);
    const isAuthorized = () => body.includes("<InfNfse");
    return { status, body, url, action: "", isAuthorized, is_authorized: isAuthorized };
  }

  async adnGet(url: string): Promise<[number, string]> {
    return this.httpsGet(url);
  }

  async bpeRecepcao(url: string, xml: string): Promise<BpeAuthResponse> {
    return this.post(url, "", xml);
  }

  async atorInteressado(uf: string, environment: SefazEnvironment, accessKey: string, tpAutor: number, verAplic: string, authorizedCnpj: string | undefined, authorizedCpf: string | undefined, tpAutorizacao: number, issuerUf: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildAtorInteressadoRequest(accessKey, tpAutor, verAplic, authorizedCnpj, authorizedCpf, tpAutorizacao, issuerUf, seq, environment, taxId));
  }

  async comprovanteEntrega(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, deliveryDate: string, docNumber: string, name: string, lat: string | undefined, long: string | undefined, hash: string, hashDate: string, issuerUf: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildComprovanteEntregaRequest(accessKey, verAplic, deliveryDate, docNumber, name, lat, long, hash, hashDate, issuerUf, seq, environment, taxId));
  }

  async cancelComprovanteEntrega(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, eventProtocol: string, issuerUf: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildCancelComprovanteEntregaRequest(accessKey, verAplic, eventProtocol, issuerUf, seq, environment, taxId));
  }

  async insucessoEntrega(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, attemptDate: string, attemptNumber: number | undefined, reasonType: number, reasonJustification: string | undefined, lat: string | undefined, long: string | undefined, hash: string, hashDate: string, issuerUf: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildInsucessoEntregaRequest(accessKey, verAplic, attemptDate, attemptNumber, reasonType, reasonJustification, lat, long, hash, hashDate, issuerUf, seq, environment, taxId));
  }

  async cancelInsucessoEntrega(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, eventProtocol: string, issuerUf: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildCancelInsucessoEntregaRequest(accessKey, verAplic, eventProtocol, issuerUf, seq, environment, taxId));
  }

  async prorrogacao(uf: string, environment: SefazEnvironment, accessKey: string, protocol: string, items: rb.ProrrogacaoItem[], taxId: string, secondTerm = false, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildProrrogacaoRequest(accessKey, protocol, items, secondTerm, seq, environment, taxId));
  }

  async cancelProrrogacao(uf: string, environment: SefazEnvironment, accessKey: string, protocol: string, taxId: string, secondTerm = false, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildCancelProrrogacaoRequest(accessKey, protocol, secondTerm, seq, environment, taxId));
  }

  async cancelSubstituicao(uf: string, environment: SefazEnvironment, accessKey: string, refAccessKey: string, protocol: string, justification: string, verAplic: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildCancelSubstituicaoRequest(accessKey, refAccessKey, protocol, justification, verAplic, seq, environment, taxId));
  }

  async rtcInfoPagtoIntegral(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcInfoPagtoIntegral(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcAceiteDebito(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, protocol: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcAceiteDebito(accessKey, verAplic, protocol, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcCancelaEvento(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, eventProtocol: string, eventTypeToCancel: number, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcCancelaEvento(accessKey, verAplic, eventProtocol, eventTypeToCancel, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcSolApropCredPresumido(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, itens: rb.RtcCredPresItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcSolApropCredPresumido(accessKey, verAplic, itens, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcDestinoConsumoPessoal(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcDestinoConsumoPessoal(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcImobilizacaoItem(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcImobilizacaoItem(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcApropriacaoCreditoComb(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcApropriacaoCreditoComb(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcApropriacaoCreditoBens(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcApropriacaoCreditoBens(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcManifTransfCredIbs(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, aceite: boolean, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcManifTransfCredIbs(accessKey, verAplic, aceite, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcManifTransfCredCbs(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, aceite: boolean, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcManifTransfCredCbs(accessKey, verAplic, aceite, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcImportacaoZfm(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcImportacaoZfm(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcRouboPerdaAdquirente(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcRouboPerdaAdquirente(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcRouboPerdaFornecedor(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcRouboPerdaFornecedor(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcFornecimentoNaoRealizado(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, items: rb.RtcItem[], taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcFornecimentoNaoRealizado(accessKey, verAplic, items, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcAtualizacaoDataEntrega(uf: string, environment: SefazEnvironment, accessKey: string, verAplic: string, dataEntrega: string, taxId: string, seq = 1): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, rb.buildRtcAtualizacaoDataEntrega(accessKey, verAplic, dataEntrega, seq, environment, taxId, getStateCode(uf)));
  }

  async rtcGeneric(uf: string, environment: SefazEnvironment, requestXml: string): Promise<SefazRawResponse> {
    return this.send(uf, environment, SefazService.RecepcaoEvento, requestXml);
  }

  // Aliases snake_case para aproximar a API Rust.
  send_model = this.sendModel;
  sefaz_validate = this.sefazValidate;
  authorize_compressed = this.authorizeCompressed;
  authorize_nfce = this.authorizeNfce;
  authorize_nfce_compressed = this.authorizeNfceCompressed;
  authorize_contingency = this.authorizeContingency;
  authorize_batch = this.authorizeBatch;
  authorize_batch_compressed = this.authorizeBatchCompressed;
  authorize_batch_nfce = this.authorizeBatchNfce;
  consult_receipt = this.consultReceipt;
  dist_dfe = this.distDfe;
  epec_nfce_status = this.epecNfceStatus;
  epec_nfce = this.epecNfce;
  cancel_substituicao = this.cancelSubstituicao;
  event_batch = this.eventBatch;
  manifest_batch = this.manifestBatch;
  ator_interessado = this.atorInteressado;
  comprovante_entrega = this.comprovanteEntrega;
  cancel_comprovante_entrega = this.cancelComprovanteEntrega;
  insucesso_entrega = this.insucessoEntrega;
  cancel_insucesso_entrega = this.cancelInsucessoEntrega;
  cancel_prorrogacao = this.cancelProrrogacao;
  cte_status = this.cteStatus;
  cte_consult = this.cteConsult;
  cte_authorize = this.cteAuthorize;
  cte_recepcao_gtve = this.cteRecepcaoGtve;
  cte_recepcao_evento = this.cteRecepcaoEvento;
  mdfe_status = this.mdfeStatus;
  mdfe_consult = this.mdfeConsult;
  mdfe_authorize = this.mdfeAuthorize;
  mdfe_recepcao_evento = this.mdfeRecepcaoEvento;
  nfse_recepcao = this.nfseRecepcao;
  nfse_recepcao_url = this.nfseRecepcaoUrl;
  nfse_evento = this.nfseEvento;
  https_get = this.httpsGet;
  nfse_consulta = this.nfseConsulta;
  adn_get = this.adnGet;
  bpe_recepcao = this.bpeRecepcao;
  rtc_info_pagto_integral = this.rtcInfoPagtoIntegral;
  rtc_aceite_debito = this.rtcAceiteDebito;
  rtc_cancela_evento = this.rtcCancelaEvento;
  rtc_sol_aprop_cred_presumido = this.rtcSolApropCredPresumido;
  rtc_destino_consumo_pessoal = this.rtcDestinoConsumoPessoal;
  rtc_imobilizacao_item = this.rtcImobilizacaoItem;
  rtc_apropriacao_credito_comb = this.rtcApropriacaoCreditoComb;
  rtc_apropriacao_credito_bens = this.rtcApropriacaoCreditoBens;
  rtc_manif_transf_cred_ibs = this.rtcManifTransfCredIbs;
  rtc_manif_transf_cred_cbs = this.rtcManifTransfCredCbs;
  rtc_importacao_zfm = this.rtcImportacaoZfm;
  rtc_roubo_perda_adquirente = this.rtcRouboPerdaAdquirente;
  rtc_roubo_perda_fornecedor = this.rtcRouboPerdaFornecedor;
  rtc_fornecimento_nao_realizado = this.rtcFornecimentoNaoRealizado;
  rtc_atualizacao_data_entrega = this.rtcAtualizacaoDataEntrega;

  private async sendCte(uf: string, environment: SefazEnvironment, service: CteService, requestXml: string, meta = getCteServiceMeta(service), compressed = false): Promise<SefazRawResponse> {
    const url = getCteUrl(uf, environment, getCteServiceUrlKey(service));
    if (!url) throw new Error(`CT-e URL not found for ${uf}/${service}`);
    const envelope = compressed ? buildCteEnvelopeCompressed(requestXml, meta) : buildCteEnvelope(requestXml, meta);
    return this.post(url, buildCteAction(meta), envelope);
  }

  private async sendMdfe(uf: string, environment: SefazEnvironment, service: MdfeService, requestXml: string, compressed = false): Promise<SefazRawResponse> {
    const meta = getMdfeServiceMeta(service);
    const url = getMdfeUrl(uf, environment, getMdfeServiceUrlKey(service));
    if (!url) throw new Error(`MDF-e URL not found for ${uf}/${service}`);
    const envelope = compressed ? buildMdfeEnvelopeCompressed(requestXml, meta) : buildMdfeEnvelope(requestXml, meta);
    return this.post(url, buildMdfeAction(meta), envelope);
  }

  private async post(url: string, action: string, body: string): Promise<SefazRawResponse> {
    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": action ? `application/soap+xml; charset=utf-8; action="${action}"` : "text/xml; charset=utf-8",
      },
      body,
    });
    return { status: response.status, body: await response.text(), url, action };
  }
}

export const Sefaz_Client = SefazClient;
