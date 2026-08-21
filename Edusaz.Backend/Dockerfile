FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore as distinct layers
COPY ["Edusaz.API/Edusaz.API.csproj", "Edusaz.API/"]
COPY ["Edusaz.Application/Edusaz.Application.csproj", "Edusaz.Application/"]
COPY ["Edusaz.Domain/Edusaz.Domain.csproj", "Edusaz.Domain/"]
COPY ["Edusaz.Infrastructure/Edusaz.Infrastructure.csproj", "Edusaz.Infrastructure/"]

RUN dotnet restore "Edusaz.API/Edusaz.API.csproj"

# Copy the rest of the files
COPY . .
WORKDIR "/src/Edusaz.API"
RUN dotnet build "Edusaz.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Edusaz.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create directory for uploads if they are stored locally
RUN mkdir -p /app/wwwroot/uploads

ENTRYPOINT ["dotnet", "Edusaz.API.dll"]
