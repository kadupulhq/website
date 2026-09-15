---
title: "O que é o Kadupul"
description: "Consulte dispositivos através de SNMP e scripts, guarde medições em arquivos RRD e produza gráficos."
banner:
  content: "O Kadupul está em fase pré-alfa. O código está disponível, mas não existe uma versão com suporte para produção nem uma migração validada. Não o utilize em produção."
---

O Kadupul é uma derivação independente do Cacti. Consulta dispositivos a intervalos regulares e utiliza o RRDtool para armazenar e representar medições.

Esta página é um resumo. Consulte a página completa em inglês para obter mais informações. [English](/start/what-kadupul-is/)

## O que é o Kadupul

- Um aplicativo PHP fornece a interface e o instalador.
- O MySQL ou MariaDB armazena a configuração, os usuários e o cache do coletor.
- Os arquivos RRD guardam medições de acordo com os períodos de retenção e as regras de consolidação configurados. Não conservam todos os dados indefinidamente.
- Um agendador inicia o coletor. Os scripts de coleta são executados com as permissões da respectiva conta de sistema.

## Primeiros passos

Comece com uma instalação de teste isolada, adicione um dispositivo e confirme a chegada dos dados antes de interpretar os gráficos. Mantenha backups e teste a restauração.

- [Instalação](/pt-br/start/install/)
- [Adicionar o primeiro dispositivo](/pt-br/start/first-device/)
- [Interpretar o primeiro gráfico](/pt-br/start/first-graph/)
