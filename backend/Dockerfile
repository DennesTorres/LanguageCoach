FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for better layer caching
COPY LanguageCoach.sln ./
COPY LanguageCoach.Api/LanguageCoach.Api.csproj LanguageCoach.Api/
COPY LanguageCoach.Application/LanguageCoach.Application.csproj LanguageCoach.Application/
COPY LanguageCoach.Core/LanguageCoach.Core.csproj LanguageCoach.Core/
COPY LanguageCoach.Infrastructure/LanguageCoach.Infrastructure.csproj LanguageCoach.Infrastructure/

RUN dotnet restore

# Copy all source code
COPY . .

# Build
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LanguageCoach.Api.dll"]
