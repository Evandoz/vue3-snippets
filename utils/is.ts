export function isPhone(obj: any): boolean {
  return /^1[3-9]\d{9}$/.test(obj);
}

export function isEmail(obj: any): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(obj);
}

export function isDomain(obj: any): boolean {
  return /^[a-zA-Z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,6}$/.test(obj);
}

export function isIpv4(obj: any): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(obj);
}

export function isIpv4Cidr(obj: any): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(obj);
}

export function isIpv6(obj: any): boolean {
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(obj);
}

export function isIpv6Cidr(obj: any): boolean {
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\/\d{1,2}$/.test(obj);
}

export function isIp(obj: any): boolean {
  return isIpv4(obj) || isIpv6(obj);
}

export function isIpCidr(obj: any): boolean {
  return isIpv4Cidr(obj) || isIpv6Cidr(obj);
}

export function isMac(obj: any): boolean {
  return /^([0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}$/.test(obj);
}
