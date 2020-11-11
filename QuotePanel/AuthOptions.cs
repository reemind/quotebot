using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace QuotePanel
{
    public class AuthOptions
    {
        public const string ISSUER = "QuoteBot"; // издатель токена
        public const string AUDIENCE = "QuotePanelReact"; // потребитель токена
        const string KEY = "mysupersecret_secretkey!123";   // ключ для шифрации
        public const int LIFETIME = 10; // время жизни токена - 1 минута
        public static SymmetricSecurityKey GetSymmetricSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.ASCII.GetBytes(KEY));
        }
    }
}