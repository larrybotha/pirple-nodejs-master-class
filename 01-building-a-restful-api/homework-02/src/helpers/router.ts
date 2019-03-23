import {RequestData, RequestPayload} from '../types/requests';
import {Service, ServiceConfig, ServiceMethod} from '../types/services';

import {forbidden} from '../services/forbidden';

type GetServiceConfig = (
  serviceConfigs: ServiceConfig[],
  requestPath: string
) => ServiceConfig;
const getServiceConfig: GetServiceConfig = (serviceConfigs, requestPath) => {
  const requestPathParts = requestPath.split('/').filter(Boolean);
  const serviceConfig = serviceConfigs.find(config => {
    const servicePathParts = config.path.split('/');

    return servicePathParts.every((part, i) =>
      !/^:/.test(part) ? part === requestPathParts[i] : true
    );
  });

  return serviceConfig;
};

type GetServiceMethod = (
  serviceConfig: ServiceConfig,
  methodName: RequestData['method']
) => ServiceMethod;
const getServiceMethod: GetServiceMethod = (
  {allowedMethods, service},
  methodName
) => {
  const method = methodName.toLowerCase();

  if (allowedMethods.indexOf(method) > -1) {
    const serviceMethod: ServiceMethod = service[method];

    return serviceMethod;
  } else {
    return forbidden;
  }
};

export {getServiceConfig, getServiceMethod};
