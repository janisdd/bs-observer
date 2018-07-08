export class Normalizer {

  private static realBaseUrl = 'https://bs.to/serie/'

  public static normalizeBsUrl(url: string): string | null {

    url = url.trim()

    if (url.startsWith(Normalizer.realBaseUrl) === false) {
      return null
    }

    const lastUrlPart = url.substr(this.realBaseUrl.length)

    const index = lastUrlPart.indexOf('/')

    if (index === -1) {
      //https://bs.to/serie/Sword-Art-Online
      return url
    }

    const baseName = lastUrlPart.substring(0, index)
    //was //https://bs.to/serie/Sword-Art-Online/1
    //https://bs.to/serie/Sword-Art-Online

    if (baseName === '') {
      return null
    }

    return this.realBaseUrl + baseName
  }
}