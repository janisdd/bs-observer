export class Normalizer {

  private static realBaseUrl = 'https://bs.to/serie/'
  private static pattern = /http(s)?:\/\/bs.*/

  public static normalizeBsUrl(url: string): string | null {

    url = url.trim()


    const firstIndex = url.search(this.pattern)


    if (firstIndex === -1) {
      //this is not a proper url
      return null
    }

    const truncatedUrl = url.substr(firstIndex)

    if (truncatedUrl.startsWith(Normalizer.realBaseUrl) === false) {
      return null
    }

    const lastUrlPart = truncatedUrl.substr(this.realBaseUrl.length)

    const index = lastUrlPart.indexOf('/')

    if (index === -1) {
      //https://bs.to/serie/Sword-Art-Online
      return truncatedUrl
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