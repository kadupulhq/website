---
title: "O que é o Kadupul"
description: "Consulte dispositivos através de SNMP e scripts, guarde medições em ficheiros RRD e produza gráficos."
banner:
  content: "O Kadupul está em fase pré-alfa. O código está disponível, mas não existe uma versão com suporte para produção nem uma migração validada. Não o utilize em produção."
---

O Kadupul é uma derivação independente do Cacti. Consulta dispositivos a intervalos regulares e utiliza o RRDtool para armazenar e representar medições.

Esta página é um resumo. Consulte a página completa em inglês para obter mais informações. [English](/start/what-kadupul-is/)

## O que é o Kadupul

- Uma aplicação PHP fornece a interface e o instalador.
- O MySQL ou MariaDB armazena a configuração, os utilizadores e a cache do coletor.
- Os ficheiros RRD guardam medições de acordo com os períodos de retenção e as regras de consolidação configurados. Não conservam todos os dados indefinidamente.
- Um agendador inicia o coletor. Os scripts de recolha são executados com as permissões da respetiva conta de sistema.

## Primeiros passos

Comece por uma instalação de teste isolada, adicione um dispositivo e confirme a chegada dos dados antes de interpretar os gráficos. Mantenha cópias de segurança e teste o restauro.

- [Instalação](/pt-pt/start/install/)
- [Adicionar o primeiro dispositivo](/pt-pt/start/first-device/)
- [Interpretar o primeiro gráfico](/pt-pt/start/first-graph/)
